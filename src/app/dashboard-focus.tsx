"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowUpRight, CalendarCheck, Check, Clock3, Dumbbell, Ruler } from "lucide-react";
import { WORKOUT_TEMPLATE } from "@/features/workouts/data/template";

type Workout = { _id: string; dayKey: string; startedAt: string };
type Measurement = { _id: string; measuredAt: string; bodyWeightKg?: number };

function localDateKey(value: string | Date) { const date = new Date(value); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }

const workoutRotation = ["push-a", "pull-a", "legs-a", "legs-b"] as const;

function nextWorkoutKey(workouts: Workout[]) {
  const latest = [...workouts].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
  if (!latest) return workoutRotation[0];
  const latestIndex = workoutRotation.indexOf(latest.dayKey as (typeof workoutRotation)[number]);
  return latestIndex === -1 ? workoutRotation[0] : workoutRotation[(latestIndex + 1) % workoutRotation.length];
}

export function DashboardFocus() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  useEffect(() => {
    Promise.all([fetch("/api/workouts"), fetch("/api/measurements")]).then(async ([workoutsResponse, measurementsResponse]) => {
      setWorkouts(workoutsResponse.ok ? await workoutsResponse.json() : []);
      setMeasurements(measurementsResponse.ok ? await measurementsResponse.json() : []);
    }).catch(() => { setWorkouts([]); setMeasurements([]); });
  }, []);

  const todayKey = localDateKey(new Date());
  const todayWorkout = workouts.find((workout) => localDateKey(workout.startedAt) === todayKey);
  const currentWorkoutKey = todayWorkout?.dayKey ?? nextWorkoutKey(workouts);
  const currentWorkoutLabel = WORKOUT_TEMPLATE[currentWorkoutKey as keyof typeof WORKOUT_TEMPLATE]?.label ?? "Current workout";
  const today = new Date();
  const measurementToday = measurements.some((measurement) => localDateKey(measurement.measuredAt) === todayKey);
  const measurementDay = 6;
  const daysUntilMeasurement = (measurementDay - today.getDay() + 7) % 7;
  const measurementPending = today.getDay() === measurementDay && !measurementToday;
  const measurementStatus = measurementToday ? "Entered today" : measurementPending ? "Pending today" : `Upcoming in ${daysUntilMeasurement} ${daysUntilMeasurement === 1 ? "day" : "days"}`;
  const workoutsThisWeek = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);
    return workouts.filter((workout) => new Date(workout.startedAt) >= start).length;
  }, [workouts]);

  return <>
    <div className="rounded-2xl border border-line/70 bg-panel/35 p-6"><div className="flex items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-sm text-muted"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple/10 text-purple"><CalendarCheck className="h-4 w-4" aria-hidden="true" /></span>Weekly workout target</p><h2 className="mt-5 text-2xl font-medium tracking-tight">{workoutsThisWeek} of 6 sessions logged</h2></div><span className="rounded-full bg-purple/10 px-2.5 py-1 text-xs font-medium text-purple">Week 01</span></div><div className="mt-7"><div className="h-2 overflow-hidden rounded-full bg-purple/10"><span className="block h-full rounded-full bg-purple transition-all" style={{ width: `${Math.min(100, (workoutsThisWeek / 6) * 100)}%` }} /></div><p className="mt-3 text-sm text-muted">{workoutsThisWeek >= 6 ? "Weekly target reached." : `${6 - workoutsThisWeek} more ${6 - workoutsThisWeek === 1 ? "session" : "sessions"} to reach this week’s target.`}</p></div><Link href="/training?section=workout-history" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-purple transition hover:text-ink">Review workout history <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div>
    <div className="rounded-2xl border border-line/70 bg-panel/35 p-6"><div className="flex items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-sm text-muted"><span className={`flex h-7 w-7 items-center justify-center rounded-lg ${todayWorkout && measurementToday ? "bg-positive/15 text-positive" : "bg-caution/15 text-caution"}`}>{todayWorkout && measurementToday ? <Check className="h-4 w-4" aria-hidden="true" /> : <AlertCircle className="h-4 w-4" aria-hidden="true" />}</span>Readiness check</p><h2 className="mt-5 text-2xl font-medium tracking-tight">{todayWorkout ? "Workout entered today." : "Workout entry pending."}</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted">{todayWorkout ? `${currentWorkoutLabel} is logged. Keep your measurement rhythm on track below.` : `Log ${currentWorkoutLabel.toLowerCase()} to keep today’s training record current.`}</p></div></div><div className="mt-7 space-y-4"><div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-sm text-muted"><Dumbbell className="h-4 w-4" aria-hidden="true" />Workout entry</span><span className={`flex items-center gap-1.5 text-sm font-medium ${todayWorkout ? "text-positive" : "text-caution"}`}>{todayWorkout ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />}{todayWorkout ? "Entered today" : "Pending today"}</span></div><div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-sm text-muted"><Ruler className="h-4 w-4" aria-hidden="true" />Measurement check-in</span><span className={`flex items-center gap-1.5 text-sm font-medium ${measurementToday ? "text-positive" : measurementPending ? "text-caution" : "text-muted"}`}>{measurementToday ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />}{measurementStatus}</span></div><p className="text-xs leading-5 text-muted">Measurements are checked every Saturday.</p></div><div className="mt-7 flex flex-wrap gap-x-5 gap-y-2"><Link href={`/workouts/${currentWorkoutKey}`} className="inline-flex items-center gap-1 text-sm font-medium text-purple transition hover:text-ink">{todayWorkout ? "Review workout" : "Log today’s workout"} <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link><Link href="/measurements" className="inline-flex items-center gap-1 text-sm font-medium text-purple transition hover:text-ink">{measurementPending ? "Log measurement" : "Open measurements"} <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div></div>
  </>;
}
