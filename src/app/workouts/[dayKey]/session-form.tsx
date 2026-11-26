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

  return <form action={submit} className="flex min-h-0 flex-1 flex-col pb-0">
    <input type="hidden" name="startedAt" value={selectedDate || format(new Date(), "yyyy-MM-dd")} />
    <div className="workout-session-content flex min-h-0 flex-1 flex-col justify-center">
    <div className="workout-log-body-map mb-4"><WorkoutBodyMap exercises={exercises.filter((exercise) => exercise.id === activeExerciseId)} width={224} /></div>
    <div className="workout-exercise-scroll stagger flex-none space-y-4 overflow-visible">
      {exercises.map((exercise) => <section id={exercise.id} key={exercise.id} onClick={() => setActiveExerciseId(exercise.id)} onFocusCapture={() => setActiveExerciseId(exercise.id)} className={`workout-input-panel workout-exercise-item overflow-hidden ${exercise.id === activeExerciseId ? "workout-selected" : "hidden"}`}>
        {exercise.finisher && <div className="flex items-center justify-end gap-4 px-4 py-1 md:px-5"><span className="hidden rounded-md bg-caution/10 px-2 py-1 text-[10px] text-caution sm:inline">Finisher</span></div>}
        <div className="workout-set-header hidden grid-cols-3 gap-3 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.14em] text-muted md:grid md:px-5"><span>Kg</span><span>Reps</span><span>RIR</span></div>
        <div>
          {Array.from({ length: exercise.sets }, (_, index) => { const set = initialSets[exercise.id]?.[index]; return <div className="workout-set-row grid grid-cols-3 items-center gap-2 px-4 py-1.5 md:gap-3 md:px-5" key={index}><label><span className="sr-only">{exercise.name} set {index + 1} weight in kg</span><input name={`${exercise.id}-weight-${index}`} type="number" min="0" step="0.5" inputMode="decimal" placeholder="kg" defaultValue={set?.weight ?? ""} className="workout-input" /></label><label><span className="sr-only">{exercise.name} set {index + 1} repetitions</span><input name={`${exercise.id}-reps-${index}`} type="number" min="0" placeholder="reps" defaultValue={set?.repetitions ?? ""} className="workout-input" /></label><label><span className="sr-only">{exercise.name} set {index + 1} reps in reserve</span><input name={`${exercise.id}-rir-${index}`} type="number" min="0" max="5" placeholder="RIR" defaultValue={set?.actualRIR ?? ""} className="workout-input" /></label></div>; })}
          <div className="flex justify-end px-4 pt-2 md:px-5"><span className="rounded-full border border-line bg-paper/30 px-2.5 py-1 font-mono text-[10px] text-muted">{exercise.sets} {exercise.sets === 1 ? "set" : "sets"}</span></div>
        </div>
        {exercise.finisher && <p className="px-4 py-3 text-xs leading-5 text-caution md:px-5">{exercise.finisher}</p>}
      </section>)}
    </div>
    </div>
    <div className="workout-action-bar flex flex-wrap items-center justify-end gap-3"><Link href={`/training?section=calendar&workout=${encodeURIComponent(dayKey)}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-purple px-3 text-sm font-medium text-purple transition hover:bg-purple/10"><CalendarDays className="h-4 w-4" aria-hidden="true" />{editId ? "Change date" : "Choose date"}</Link><button disabled={saving} className="inline-flex h-10 items-center justify-center rounded-xl bg-purple px-5 text-sm font-semibold text-white shadow-[0_0_24px_hsl(var(--purple)/.2)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60">{saving ? (editId ? "Updating workout…" : "Saving workout…") : (editId ? "Update workout" : "Save workout")}</button></div>
    {message && <p role="status" className="mt-2 text-right text-xs text-positive">{message}</p>}
  </form>;
}
