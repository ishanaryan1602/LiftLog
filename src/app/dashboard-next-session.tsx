"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { WORKOUT_TEMPLATE, prescribedSetTotal } from "@/features/workouts/data/template";

type Workout = { dayKey: string; startedAt: string };
type DayKey = keyof typeof WORKOUT_TEMPLATE;

const ROTATION: DayKey[] = ["push-a", "pull-a", "legs-a", "legs-b"];

function nextWorkoutKey(workouts: Workout[]) {
  const latest = [...workouts].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
  if (!latest) return ROTATION[0];
  const latestIndex = ROTATION.indexOf(latest.dayKey as DayKey);
  return latestIndex === -1 ? ROTATION[0] : ROTATION[(latestIndex + 1) % ROTATION.length];
}

export function DashboardNextSession() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/workouts").then((response) => response.ok ? response.json() : []).then((items: Workout[]) => setWorkouts(items)).catch(() => setWorkouts([])).finally(() => setLoaded(true));
  }, []);

  const dayKey = useMemo(() => nextWorkoutKey(workouts), [workouts]);
  const day = WORKOUT_TEMPLATE[dayKey];

  return <div>
    <p className="text-sm text-muted">Your next session</p>
    <h2 className="mt-3 text-5xl font-semibold tracking-[-.06em] md:text-7xl">{loaded ? day.label : "Loading…"}</h2>
    <p className="mt-5 max-w-md text-sm leading-6 text-muted">{day ? `${prescribedSetTotal(dayKey)} working sets built around controlled reps, consistent effort, and steady progress.` : "Checking your training rotation…"}</p>
    <div className="mt-8 flex flex-wrap items-center gap-4"><Link href={`/workouts/${dayKey}`} className="inline-flex rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110">Start workout</Link><Link href="/training" className="text-sm font-medium text-muted transition hover:text-ink">View training →</Link></div>
  </div>;
}
