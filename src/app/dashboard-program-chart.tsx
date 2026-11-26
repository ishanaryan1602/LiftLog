"use client";

import { useEffect, useMemo, useState } from "react";
import { WORKOUT_TEMPLATE } from "@/features/workouts/data/template";

type Workout = { dayKey: string; startedAt: string; exercises: { sets: { weight?: number; repetitions?: number }[] }[] };
const labels: Record<string, string> = { "push-a": "Push workout", "pull-a": "Pull workout", "legs-a": "Leg A workout", "push-b": "Push workout", "pull-b": "Pull workout", "legs-b": "Leg B workout" };
function localDateKey(value: string | Date) { const date = new Date(value); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }

export function DashboardProgramChart() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => { fetch("/api/workouts").then((response) => response.ok ? response.json() : []).then(setWorkouts).catch(() => setWorkouts([])); }, []);

  const progress = useMemo(() => {
    const sorted = [...workouts].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    const today = localDateKey(new Date());
    const todayWorkout = sorted.find((workout) => localDateKey(workout.startedAt) === today);
    const focusKey = todayWorkout?.dayKey ?? sorted[0]?.dayKey ?? "push-a";
    const allSessions = sorted.filter((workout) => workout.dayKey === focusKey).reverse();
    const sessions = allSessions.slice(-16);
    const strengthScores = allSessions.map((session) => { const sets = session.exercises.flatMap((exercise) => exercise.sets).filter((set) => Number(set.weight) > 0 && Number(set.repetitions) > 0); return sets.length ? sets.reduce((total, set) => total + Number(set.weight) * Number(set.repetitions), 0) / sets.length : 0; }).filter((score) => score > 0);
    const midpoint = Math.max(1, Math.floor(strengthScores.length / 2));
    const average = (values: number[]) => values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
    const baseline = average(strengthScores.slice(0, midpoint));
    const recent = average(strengthScores.slice(midpoint));
    const change = baseline && recent ? Math.round(((recent - baseline) / baseline) * 100) : 0;
    const sessionScores = sessions.map((session) => { const sets = session.exercises.flatMap((exercise) => exercise.sets).filter((set) => Number(set.weight) > 0 && Number(set.repetitions) > 0); return sets.length ? sets.reduce((total, set) => total + Number(set.weight) * Number(set.repetitions), 0) / sets.length : 0; });
    const maxScore = Math.max(...sessionScores, 0);
    return { focusKey, sessions, change, trend: !baseline || strengthScores.length < 2 ? "Need more data" : change > 3 ? "Increasing" : change < -3 ? "Decreasing" : "Stable", bars: Array.from({ length: 16 }, (_, index) => { const score = sessionScores[index]; return score ? Math.max(12, Math.round((score / maxScore) * 100)) : 0; }) };
  }, [workouts]);

  return <div ><div ><span>{labels[progress.focusKey] ?? progress.focusKey} progress</span><span>{progress.sessions.length} logged</span></div><div >{progress.bars.map((value, index) => <span key={index} title={value ? `${labels[progress.focusKey]} · ${value}% complete` : "Not logged"}   />)}</div><div ><span>Start</span><span>{progress.trend}{progress.change ? ` · ${progress.change > 0 ? "+" : ""}${progress.change}%` : ""}</span><span>Week 16</span></div></div>;
}
