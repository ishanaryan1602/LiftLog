"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, Sparkles } from "lucide-react";
import { Badge, Card } from "@/components/ui";

type Report = { headline: string; summary: string; confidence: "low" | "moderate" | "high"; metrics: Array<{ value: string; label: string }>; flags: Array<{ label: string; detail: string; status: "positive" | "neutral" | "caution" }>; exerciseRecommendations: Array<{ exercise: string; status: "positive" | "neutral" | "caution"; repPattern: string; suggestedWeight: string; recommendation: string }>; recommendation: string };

export function WorkoutAiSummary({ workoutId, fullPage = false }: { workoutId: string; fullPage?: boolean }) {
  const [report, setReport] = useState<Report>();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/ai/workout?id=${encodeURIComponent(workoutId)}`).then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Workout analysis is unavailable.");
      if (!cancelled) setReport(payload.report);
    }).catch((error) => { if (!cancelled) setMessage(error instanceof Error ? error.message : "Workout analysis is unavailable."); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [workoutId]);

  return <Card className={`workout-ai-scroll min-h-0 overflow-y-auto border border-line/70 bg-panel/45 p-6 ${fullPage ? "" : "xl:mb-[100px] xl:sticky xl:top-6 xl:max-h-[calc(100vh-8rem)]"}`}><div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-sm text-muted"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple/10 text-purple"><Sparkles className="h-4 w-4" aria-hidden="true" /></span>AI summary</p>{report && <Badge tone={report.confidence === "high" ? "positive" : report.confidence === "moderate" ? "caution" : "neutral"}>Cached</Badge>}</div>{loading ? <div className="mt-8 flex items-center gap-3 text-sm text-muted"><LoaderCircle className="h-4 w-4 animate-spin text-purple" />Analyzing this workout…</div> : !report ? <div className="mt-8 flex items-start gap-3 text-sm leading-6 text-muted"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-caution" />{message}</div> : <><h2 className="mt-5 text-2xl font-medium tracking-tight">{report.headline}</h2><p className="mt-3 text-sm leading-6 text-muted">{report.summary}</p><div className="mt-6 grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div className="space-y-5 py-2">{report.metrics.map((metric) => <div key={`${metric.value}-${metric.label}`}><p className="text-xl font-semibold tracking-tight">{metric.value}</p><p className="mt-1 text-[11px] text-muted">{metric.label}</p></div>)}</div><div className="space-y-5">{report.flags.map((flag) => <div key={flag.label} className="pt-1"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium">{flag.label}</p><Badge tone={flag.status}>{flag.status === "positive" ? "On track" : flag.status === "caution" ? "Watch" : "Observed"}</Badge></div><p className="mt-2 text-sm leading-6 text-muted">{flag.detail}</p></div>)}</div></div><div className="mt-8"><h3 className="text-[11px] uppercase tracking-[.14em] text-muted">Exercise load decisions</h3><div className="mt-3 grid gap-4 lg:grid-cols-2">{report.exerciseRecommendations.map((item) => <div key={item.exercise} className="rounded-xl border border-line/70 bg-paper/30 p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium">{item.exercise}</p><Badge tone={item.status}>{item.suggestedWeight}</Badge></div><p className="mt-2 text-xs leading-5 text-muted">{item.repPattern}</p><p className="mt-2 text-sm leading-5 text-ink">{item.recommendation}</p></div>)}</div></div><div className="mt-6 rounded-xl border border-line/70 bg-paper/30 p-4"><p className="text-[11px] uppercase tracking-[.14em] text-muted">Next session</p><p className="mt-2 text-sm leading-6 text-ink">{report.recommendation}</p></div></>}</Card>;
}
