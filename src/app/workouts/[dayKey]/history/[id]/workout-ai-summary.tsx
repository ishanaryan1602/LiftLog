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

  return <Card ><div ><p ><span ><Sparkles  aria-hidden="true" /></span>AI summary</p>{report && <Badge tone={report.confidence === "high" ? "positive" : report.confidence === "moderate" ? "caution" : "neutral"}>Cached</Badge>}</div>{loading ? <div ><LoaderCircle  />Analyzing this workout…</div> : !report ? <div ><AlertCircle  />{message}</div> : <><h2 >{report.headline}</h2><p >{report.summary}</p><div ><div >{report.metrics.map((metric) => <div key={`${metric.value}-${metric.label}`}><p >{metric.value}</p><p >{metric.label}</p></div>)}</div><div >{report.flags.map((flag) => <div key={flag.label} ><div ><p >{flag.label}</p><Badge tone={flag.status}>{flag.status === "positive" ? "On track" : flag.status === "caution" ? "Watch" : "Observed"}</Badge></div><p >{flag.detail}</p></div>)}</div></div><div ><h3 >Exercise load decisions</h3><div >{report.exerciseRecommendations.map((item) => <div key={item.exercise} ><div ><p >{item.exercise}</p><Badge tone={item.status}>{item.suggestedWeight}</Badge></div><p >{item.repPattern}</p><p >{item.recommendation}</p></div>)}</div></div><div ><p >Next session</p><p >{report.recommendation}</p></div></>}</Card>;
}
