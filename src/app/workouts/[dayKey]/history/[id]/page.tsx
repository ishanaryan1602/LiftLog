"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ArrowUpRight, ChartNoAxesCombined } from "lucide-react";
import { notFound } from "next/navigation";
import { DetailLayout } from "@/components/detail-layout";
import { WORKOUT_TEMPLATE } from "@/features/workouts/data/template";
import { WorkoutBodyMap } from "@/features/workouts/body-map";
import { SessionSequence } from "../../session-sequence";
import { Badge, Card } from "@/components/ui";

type LoggedSet = { setNumber: number; weight: number; repetitions: number; actualRIR?: number; completed: boolean };
type LoggedExercise = { exerciseId: string; exerciseName: string; sets: LoggedSet[] };
type Workout = { _id: string; dayKey: string; startedAt: string; notes?: string; exercises: LoggedExercise[] };

function historyExerciseName(exercise: LoggedExercise) {
  return exercise.exerciseId === "single-arm-triceps-pushdown" || exercise.exerciseName === "Single-Arm Triceps Pushdown" ? "V Bar Tricep Pushdown" : exercise.exerciseName;
}

export default function WorkoutHistoryDetail({ params }: { params: Promise<{ dayKey: string; id: string }> }) {
  const [route, setRoute] = useState<{ dayKey: string; id: string }>();
  const [workout, setWorkout] = useState<Workout>();
  const [error, setError] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>();

  useEffect(() => { void params.then(setRoute); }, [params]);
  useEffect(() => {
    if (!route) return;
    void fetch(`/api/workouts?id=${encodeURIComponent(route.id)}`).then((response) => response.ok ? response.json() : Promise.reject()).then(setWorkout).catch(() => setError(true));
  }, [route]);
  useEffect(() => {
    const syncSelection = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (workout?.exercises.some((exercise) => exercise.exerciseId === id)) setSelectedExerciseId(id);
    };
    window.addEventListener("workout:select", syncSelection);
    return () => window.removeEventListener("workout:select", syncSelection);
  }, [workout]);

  if (error) notFound();
  if (!route || !workout) return <div >Loading workout…</div>;

  const day = WORKOUT_TEMPLATE[route.dayKey as keyof typeof WORKOUT_TEMPLATE];
  const label = day?.label ?? workout.dayKey;
  const date = format(new Date(workout.startedAt), "d MMM yyyy");
  const selectedExercise = workout.exercises.find((exercise) => exercise.exerciseId === selectedExerciseId) ?? workout.exercises[0];
  const targetSets = workout.exercises.reduce((total, exercise) => total + (exercise.sets.length ? exercise.sets.length : 0), 0);
  const prescribedSets = workout.exercises.reduce((total, exercise) => total + (WORKOUT_TEMPLATE[route.dayKey as keyof typeof WORKOUT_TEMPLATE]?.exercises.find((item) => item.id === exercise.exerciseId)?.sets ?? 0), 0);
  const completedSets = workout.exercises.reduce((total, exercise) => total + exercise.sets.filter((set) => set.completed).length, 0);
  const setTarget = prescribedSets || targetSets;
  const setPercent = setTarget ? Math.round((completedSets / setTarget) * 100) : 0;
  return <DetailLayout backHref="/training?section=workout-history" backLabel="Training" breadcrumbSection="Workout history" breadcrumbSectionHref="/training?section=workout-history" currentLabel={label} breadcrumbTail={date} scrollable showHeader={false} sidebar={<SessionSequence exercises={day?.exercises ?? []} />}>
    <div >
    <div >
      {selectedExercise && <div ><div><p >Selected exercise</p><h2 >{historyExerciseName(selectedExercise)}</h2></div><Badge>{selectedExercise.sets.length} {selectedExercise.sets.length === 1 ? "set" : "sets"}</Badge></div>}
      <div ><WorkoutBodyMap exercises={selectedExercise ? [{ id: selectedExercise.exerciseId }] : []} width={200} /></div>
      <div >
      {selectedExercise && (() => { const exerciseName = historyExerciseName(selectedExercise); return <section id={selectedExercise.exerciseId} key={selectedExercise.exerciseId} ><div ><span>Kg</span><span>Reps</span><span>RIR</span></div><div>{selectedExercise.sets.map((set) => <div  key={set.setNumber}><input aria-label={`${exerciseName} set ${set.setNumber} weight in kg`} readOnly value={set.weight}  /><input aria-label={`${exerciseName} set ${set.setNumber} repetitions`} readOnly value={set.repetitions}  /><input aria-label={`${exerciseName} set ${set.setNumber} reps in reserve`} readOnly value={set.actualRIR ?? ""}  /></div>)}</div></section>; })()}
      </div>
    </div>
    <aside >
      <Card ><div ><div><p >Workout completion</p><h2 >{completedSets} <span >/ {setTarget} sets</span></h2></div><Badge tone={completedSets === setTarget ? "positive" : "neutral"}>{setPercent}%</Badge></div><div ><div   /></div><p >{completedSets === setTarget ? "All prescribed sets completed." : `${Math.max(0, setTarget - completedSets)} sets remaining against the target.`}</p></Card>
      <Card ><div ><div ><ChartNoAxesCombined  aria-hidden="true" /></div><Badge>AI analysis</Badge></div><h2 >Review this workout</h2><p >See load decisions, rep-range flags, and recommendations for your next session.</p><Link href={`/workouts/${route.dayKey}/history/${workout._id}/analysis`} >Open AI analysis <ArrowUpRight  aria-hidden="true" /></Link></Card>
    </aside>
    </div>
    <div ><Link href={`/workouts/${route.dayKey}?date=${format(parseISO(workout.startedAt), "yyyy-MM-dd")}&edit=${workout._id}`} >Edit workout</Link></div>
  </DetailLayout>;
}
