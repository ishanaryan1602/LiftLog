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
  if (!route || !workout) return <div className="workout-detail mx-auto w-full text-sm text-muted">Loading workout…</div>;

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
    <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
    <div className="flex min-h-0 flex-col rounded-[1.5rem] border border-line/70 bg-panel/25 p-5">
      {selectedExercise && <div className="mb-2 flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[.14em] text-muted">Selected exercise</p><h2 className="mt-1 text-lg font-medium tracking-tight">{historyExerciseName(selectedExercise)}</h2></div><Badge>{selectedExercise.sets.length} {selectedExercise.sets.length === 1 ? "set" : "sets"}</Badge></div>}
      <div className="workout-log-body-map mb-1 !min-h-[17rem] shrink-0"><WorkoutBodyMap exercises={selectedExercise ? [{ id: selectedExercise.exerciseId }] : []} width={200} /></div>
      <div className="workout-exercise-scroll flex-none space-y-4 overflow-visible">
      {selectedExercise && (() => { const exerciseName = historyExerciseName(selectedExercise); return <section id={selectedExercise.exerciseId} key={selectedExercise.exerciseId} className="workout-input-panel workout-exercise-item workout-selected overflow-hidden"><div className="workout-set-header grid grid-cols-3 gap-3 px-1 py-2 text-[10px] font-semibold uppercase tracking-[.14em] text-muted"><span>Kg</span><span>Reps</span><span>RIR</span></div><div>{selectedExercise.sets.map((set) => <div className="workout-set-row grid grid-cols-3 items-center gap-2 py-1.5 md:gap-3" key={set.setNumber}><input aria-label={`${exerciseName} set ${set.setNumber} weight in kg`} readOnly value={set.weight} className="workout-input" /><input aria-label={`${exerciseName} set ${set.setNumber} repetitions`} readOnly value={set.repetitions} className="workout-input" /><input aria-label={`${exerciseName} set ${set.setNumber} reps in reserve`} readOnly value={set.actualRIR ?? ""} className="workout-input" /></div>)}</div></section>; })()}
      </div>
    </div>
    <aside className="space-y-4 xl:sticky xl:top-6">
      <Card className="border border-line/70 bg-panel/45 p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-muted">Workout completion</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">{completedSets} <span className="text-base font-normal text-muted">/ {setTarget} sets</span></h2></div><Badge tone={completedSets === setTarget ? "positive" : "neutral"}>{setPercent}%</Badge></div><div className="mt-6 h-2 overflow-hidden rounded-full bg-purple/10"><div className="h-full rounded-full bg-purple transition-all" style={{ width: `${Math.min(100, setPercent)}%` }} /></div><p className="mt-3 text-xs text-muted">{completedSets === setTarget ? "All prescribed sets completed." : `${Math.max(0, setTarget - completedSets)} sets remaining against the target.`}</p></Card>
      <Card className="border border-purple/25 bg-purple/5 p-6"><div className="flex items-start justify-between gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple/10 text-purple"><ChartNoAxesCombined className="h-4 w-4" aria-hidden="true" /></div><Badge>AI analysis</Badge></div><h2 className="mt-5 text-xl font-medium tracking-tight">Review this workout</h2><p className="mt-2 text-sm leading-6 text-muted">See load decisions, rep-range flags, and recommendations for your next session.</p><Link href={`/workouts/${route.dayKey}/history/${workout._id}/analysis`} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-purple transition hover:text-ink">Open AI analysis <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></Card>
    </aside>
    </div>
    <div className="workout-action-bar flex justify-end"><Link href={`/workouts/${route.dayKey}?date=${format(parseISO(workout.startedAt), "yyyy-MM-dd")}&edit=${workout._id}`} className="inline-flex h-10 items-center justify-center rounded-xl bg-purple px-4 text-sm font-semibold text-white transition hover:brightness-110">Edit workout</Link></div>
  </DetailLayout>;
}
