"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { WorkoutAiSummary } from "../workout-ai-summary";
import { WORKOUT_TEMPLATE } from "@/features/workouts/data/template";
import { AnalysisCharts } from "./analysis-charts";

type Workout = { startedAt: string; exercises: Array<{ exerciseName: string; sets: Array<{ setNumber: number; weight: number; repetitions: number; actualRIR?: number; completed: boolean }> }> };

export default function WorkoutAnalysisPage({ params }: { params: Promise<{ dayKey: string; id: string }> }) {
  const [route, setRoute] = useState<{ dayKey: string; id: string }>();
  const [date, setDate] = useState<string>();
  const [workout, setWorkout] = useState<Workout>();

  useEffect(() => { void params.then(setRoute); }, [params]);
  useEffect(() => { if (!route) return; void fetch(`/api/workouts?id=${encodeURIComponent(route.id)}`).then((response) => response.ok ? response.json() : Promise.reject()).then((record: Workout) => { setWorkout(record); setDate(format(new Date(record.startedAt), "d MMM yyyy")); }).catch(() => undefined); }, [route]);

  if (!route) return <div >Loading analysis…</div>;
  const label = WORKOUT_TEMPLATE[route.dayKey as keyof typeof WORKOUT_TEMPLATE]?.label ?? "Workout";
  return <div ><Breadcrumbs items={[{ label: "Training", href: "/training?section=workout-history" }, { label: "Workout history", href: `/workouts/${route.dayKey}/history/${route.id}` }, { label }, { label: "AI analysis" }, ...(date ? [{ label: date }] : [])]} /><section ><div ><div><p >{label} · {date ?? "Workout analysis"}</p><h1 >AI analysis</h1><p >A focused review of this logged workout, with clear signals for load selection, rep quality, and your next session.</p><Link href={`/workouts/${route.dayKey}/history/${route.id}`} ><ArrowLeft  />Back to workout</Link></div><div ><p >Analysis scope</p><p >{label}</p><p >{date ?? "Loading session date"}</p><p >The report uses the logged sets from this historical workout and keeps the original session snapshot intact.</p></div></div></section>{workout && <AnalysisCharts exercises={workout.exercises} />}<section ><div ><WorkoutAiSummary workoutId={route.id} fullPage /></div></section></div>;
}
