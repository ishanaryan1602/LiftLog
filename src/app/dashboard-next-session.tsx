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
    <p >Your next session</p>
    <h2 >{loaded ? day.label : "Loading…"}</h2>
    <p >{day ? `${prescribedSetTotal(dayKey)} working sets built around controlled reps, consistent effort, and steady progress.` : "Checking your training rotation…"}</p>
    <div ><Link href={`/workouts/${dayKey}`} >Start workout</Link><Link href="/training" >View training →</Link></div>
  </div>;
}
