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

  if (!route) return <div className="text-sm text-muted">Loading analysis…</div>;
  const label = WORKOUT_TEMPLATE[route.dayKey as keyof typeof WORKOUT_TEMPLATE]?.label ?? "Workout";
  return <div className="space-y-7"><Breadcrumbs items={[{ label: "Training", href: "/training?section=workout-history" }, { label: "Workout history", href: `/workouts/${route.dayKey}/history/${route.id}` }, { label }, { label: "AI analysis" }, ...(date ? [{ label: date }] : [])]} /><section className="relative overflow-hidden rounded-[2rem] bg-transparent px-0 py-4 md:py-6"><div className="relative grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end"><div><p className="text-sm text-muted">{label} · {date ?? "Workout analysis"}</p><h1 className="mt-3 text-5xl font-semibold tracking-[-.06em] md:text-7xl">AI analysis</h1><p className="mt-5 max-w-xl text-sm leading-6 text-muted">A focused review of this logged workout, with clear signals for load selection, rep quality, and your next session.</p><Link href={`/workouts/${route.dayKey}/history/${route.id}`} className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-purple transition hover:text-ink"><ArrowLeft className="h-4 w-4" />Back to workout</Link></div><div className="rounded-2xl border border-line/70 bg-panel/45 p-5"><p className="text-sm text-muted">Analysis scope</p><p className="mt-3 text-xl font-medium tracking-tight">{label}</p><p className="mt-2 text-sm text-muted">{date ?? "Loading session date"}</p><p className="mt-5 text-xs leading-5 text-muted">The report uses the logged sets from this historical workout and keeps the original session snapshot intact.</p></div></div></section>{workout && <AnalysisCharts exercises={workout.exercises} />}<section className="grid gap-7 lg:grid-cols-[1.1fr_.9fr]"><div className="lg:col-span-2"><WorkoutAiSummary workoutId={route.id} fullPage /></div></section></div>;
}
