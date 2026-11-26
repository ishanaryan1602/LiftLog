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
    <div ><div ><div><p ><span ><CalendarCheck  aria-hidden="true" /></span>Weekly workout target</p><h2 >{workoutsThisWeek} of 6 sessions logged</h2></div><span >Week 01</span></div><div ><div ><span   /></div><p >{workoutsThisWeek >= 6 ? "Weekly target reached." : `${6 - workoutsThisWeek} more ${6 - workoutsThisWeek === 1 ? "session" : "sessions"} to reach this week’s target.`}</p></div><Link href="/training?section=workout-history" >Review workout history <ArrowUpRight  aria-hidden="true" /></Link></div>
    <div ><div ><div><p ><span >{todayWorkout && measurementToday ? <Check  aria-hidden="true" /> : <AlertCircle  aria-hidden="true" />}</span>Readiness check</p><h2 >{todayWorkout ? "Workout entered today." : "Workout entry pending."}</h2><p >{todayWorkout ? `${currentWorkoutLabel} is logged. Keep your measurement rhythm on track below.` : `Log ${currentWorkoutLabel.toLowerCase()} to keep today’s training record current.`}</p></div></div><div ><div ><span ><Dumbbell  aria-hidden="true" />Workout entry</span><span >{todayWorkout ? <Check  aria-hidden="true" /> : <Clock3  aria-hidden="true" />}{todayWorkout ? "Entered today" : "Pending today"}</span></div><div ><span ><Ruler  aria-hidden="true" />Measurement check-in</span><span >{measurementToday ? <Check  aria-hidden="true" /> : <Clock3  aria-hidden="true" />}{measurementStatus}</span></div><p >Measurements are checked every Saturday.</p></div><div ><Link href={`/workouts/${currentWorkoutKey}`} >{todayWorkout ? "Review workout" : "Log today’s workout"} <ArrowUpRight  aria-hidden="true" /></Link><Link href="/measurements" >{measurementPending ? "Log measurement" : "Open measurements"} <ArrowUpRight  aria-hidden="true" /></Link></div></div>
  </>;
}
