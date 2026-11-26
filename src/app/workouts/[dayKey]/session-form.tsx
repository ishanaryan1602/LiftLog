"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type { ExerciseTemplate } from "@/features/workouts/data/template";
import Link from "next/link";
import { WorkoutBodyMap } from "@/features/workouts/body-map";
import { CalendarDays } from "lucide-react";

export function SessionForm({ dayKey, exercises, selectedDate, editId }: { dayKey: string; exercises: ExerciseTemplate[]; selectedDate?: string; editId?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState(exercises[0]?.id ?? "");
  const [initialSets, setInitialSets] = useState<Record<string, Array<{ weight: number; repetitions: number; actualRIR?: number }>>>({});

  useEffect(() => {
    const syncSelection = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (exercises.some((exercise) => exercise.id === id)) setActiveExerciseId(id);
    };
    window.addEventListener("workout:select", syncSelection);
    return () => window.removeEventListener("workout:select", syncSelection);
  }, [exercises]);

  useEffect(() => {
    if (!editId) return;
    void fetch(`/api/workouts?id=${encodeURIComponent(editId)}`).then((response) => response.json()).then((workout) => {
      setInitialSets(Object.fromEntries(workout.exercises.map((exercise: { exerciseId: string; sets: Array<{ weight: number; repetitions: number; actualRIR?: number }> }) => [exercise.exerciseId, exercise.sets])));
    }).catch(() => setMessage("Could not load this workout."));
  }, [editId]);

  async function submit(form: FormData) {
    setSaving(true);
    const entries = exercises.map((exercise) => ({
      exerciseId: exercise.id,
      sets: Array.from({ length: exercise.sets }, (_, index) => ({
        setNumber: index + 1,
        weight: Number(form.get(`${exercise.id}-weight-${index}`) || 0),
        repetitions: Number(form.get(`${exercise.id}-reps-${index}`) || 0),
        actualRIR: form.get(`${exercise.id}-rir-${index}`) ? Number(form.get(`${exercise.id}-rir-${index}`)) : undefined,
        completed: true,
      })),
    }));
    const workoutDate = String(form.get("startedAt") || format(new Date(), "yyyy-MM-dd"));
    const response = await fetch(editId ? `/api/workouts?id=${encodeURIComponent(editId)}` : "/api/workouts", { method: editId ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ dayKey, startedAt: new Date(`${workoutDate}T12:00:00`).toISOString(), exercises: entries }) });
    if (response.ok && !editId) {
      router.push("/training?section=workout-history");
      return;
    }
    setMessage(response.ok ? "Workout updated." : "Could not save workout. Try again.");
    setSaving(false);
  }

  return <form action={submit} >
    <input type="hidden" name="startedAt" value={selectedDate || format(new Date(), "yyyy-MM-dd")} />
    <div >
    <div ><WorkoutBodyMap exercises={exercises.filter((exercise) => exercise.id === activeExerciseId)} width={224} /></div>
    <div >
      {exercises.map((exercise) => <section id={exercise.id} key={exercise.id} onClick={() => setActiveExerciseId(exercise.id)} onFocusCapture={() => setActiveExerciseId(exercise.id)} >
        {exercise.finisher && <div ><span >Finisher</span></div>}
        <div ><span>Kg</span><span>Reps</span><span>RIR</span></div>
        <div>
          {Array.from({ length: exercise.sets }, (_, index) => { const set = initialSets[exercise.id]?.[index]; return <div  key={index}><label><span >{exercise.name} set {index + 1} weight in kg</span><input name={`${exercise.id}-weight-${index}`} type="number" min="0" step="0.5" inputMode="decimal" placeholder="kg" defaultValue={set?.weight ?? ""}  /></label><label><span >{exercise.name} set {index + 1} repetitions</span><input name={`${exercise.id}-reps-${index}`} type="number" min="0" placeholder="reps" defaultValue={set?.repetitions ?? ""}  /></label><label><span >{exercise.name} set {index + 1} reps in reserve</span><input name={`${exercise.id}-rir-${index}`} type="number" min="0" max="5" placeholder="RIR" defaultValue={set?.actualRIR ?? ""}  /></label></div>; })}
          <div ><span >{exercise.sets} {exercise.sets === 1 ? "set" : "sets"}</span></div>
        </div>
        {exercise.finisher && <p >{exercise.finisher}</p>}
      </section>)}
    </div>
    </div>
    <div ><Link href={`/training?section=calendar&workout=${encodeURIComponent(dayKey)}`} ><CalendarDays  aria-hidden="true" />{editId ? "Change date" : "Choose date"}</Link><button disabled={saving} >{saving ? (editId ? "Updating workout…" : "Saving workout…") : (editId ? "Update workout" : "Save workout")}</button></div>
    {message && <p role="status" >{message}</p>}
  </form>;
}
