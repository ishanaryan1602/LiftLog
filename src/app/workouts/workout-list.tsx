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
  return <div >
    {workoutCards.map(({ key, label }, index) => { const day = WORKOUT_TEMPLATE[key]; return <Link href={`/workouts/${key}/details` as Route} key={key}  >
      <span aria-hidden="true"  />
      <div >
        <div ><span ><span ><Dumbbell  strokeWidth={1.8} aria-hidden="true" /></span>Workout {String(index + 1).padStart(2, "0")}</span><ArrowUpRight  aria-hidden="true" /></div>
        <h2 >{label}</h2>
        <p >{day.exercises.length} exercises for a focused {label.toLowerCase()} session.</p>
      </div>
      <div ><div ><div >{day.exercises.slice(0, 3).map((exercise) => <span key={exercise.id} title={exercise.name} >{exercise.name}</span>)}</div>{day.exercises.length > 3 && <div ><span >+{day.exercises.length - 3} more</span></div>}</div><span >{prescribedSetTotal(key)} sets</span></div>
    </Link>; })}
  </div>;
}
