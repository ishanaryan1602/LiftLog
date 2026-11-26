import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, Dumbbell } from "lucide-react";
import { WORKOUT_TEMPLATE, prescribedSetTotal } from "@/features/workouts/data/template";

const workoutCards = [
  { key: "push-a" as const, label: "Push workout" },
  { key: "pull-a" as const, label: "Pull workout" },
  { key: "legs-a" as const, label: "Leg A workout" },
  { key: "legs-b" as const, label: "Leg B workout" },
];

export function WorkoutList() {
  return <div className="workout-list-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {workoutCards.map(({ key, label }, index) => { const day = WORKOUT_TEMPLATE[key]; return <Link href={`/workouts/${key}/details` as Route} key={key} style={{ animationDelay: `${index * 70}ms` }} className="group relative flex min-h-48 flex-col justify-between overflow-hidden rounded-2xl border border-line/70 bg-panel/35 p-5 transition duration-300 hover:-translate-y-1 hover:border-purple/40 hover:bg-panel/60 hover:shadow-[0_16px_40px_hsl(var(--purple)/.08)]">
      <span aria-hidden="true" className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-purple/10 blur-2xl transition duration-300 group-hover:bg-purple/20" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3 text-xs text-muted"><span className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple/10 text-purple"><Dumbbell className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" /></span>Workout {String(index + 1).padStart(2, "0")}</span><ArrowUpRight className="h-4 w-4 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-purple" aria-hidden="true" /></div>
        <h2 className="mt-7 text-xl font-medium tracking-tight text-ink">{label}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{day.exercises.length} exercises for a focused {label.toLowerCase()} session.</p>
      </div>
      <div className="relative mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3"><div className="min-w-0"><div className="flex min-w-0 flex-nowrap gap-1.5">{day.exercises.slice(0, 3).map((exercise) => <span key={exercise.id} title={exercise.name} className="w-fit max-w-[9rem] shrink truncate rounded-full border border-line bg-paper/30 px-2 py-1 text-[11px] text-muted">{exercise.name}</span>)}</div>{day.exercises.length > 3 && <div className="mt-1.5 flex"><span className="w-fit max-w-[9rem] truncate rounded-full border border-line bg-paper/30 px-2 py-1 text-[11px] text-muted">+{day.exercises.length - 3} more</span></div>}</div><span className="shrink-0 whitespace-nowrap text-xs font-medium text-muted">{prescribedSetTotal(key)} sets</span></div>
    </Link>; })}
  </div>;
}
