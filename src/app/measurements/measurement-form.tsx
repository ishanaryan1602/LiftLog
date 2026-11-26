"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";

const fields=["bodyWeightKg","leftArmCm","rightArmCm","chestCm","waistCm","shouldersCm","leftThighCm","rightThighCm"] as const;
const labels:Record<typeof fields[number],string>={bodyWeightKg:"Body weight (kg)",leftArmCm:"Left arm (cm)",rightArmCm:"Right arm (cm)",chestCm:"Chest (cm)",waistCm:"Waist (cm)",shouldersCm:"Shoulders (cm)",leftThighCm:"Left thigh (cm)",rightThighCm:"Right thigh (cm)"};
type ExistingMeasurement={_id:string;bodyWeightKg?:number;leftArmCm?:number;rightArmCm?:number;chestCm?:number;waistCm?:number;shouldersCm?:number;leftThighCm?:number;rightThighCm?:number};

export function MeasurementForm({ date, existing, onSaved }: { date: Date; existing?: ExistingMeasurement; onSaved: () => void }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [bottomSpace, setBottomSpace] = useState(0);
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((field) => [field, existing?.[field]?.toString() ?? ""])));

  useEffect(() => {
    const scrollPane = document.querySelector<HTMLElement>(".measurement-scroll");
    if (!scrollPane) return;
    const updateBottomSpace = () => {
      const lastSection = scrollPane.querySelector<HTMLElement>(".measurement-section:last-of-type");
      if (lastSection) setBottomSpace(Math.max(0, scrollPane.clientHeight - lastSection.offsetHeight));
    };
    updateBottomSpace();
    const resizeObserver = new ResizeObserver(updateBottomSpace);
    resizeObserver.observe(scrollPane);
    return () => resizeObserver.disconnect();
  }, []);

  async function submit(form: FormData) {
    setLoading(true);
    setMessage("");
    const payload: Record<string, unknown> = { measuredAt: format(date, "yyyy-MM-dd") };
    for (const field of fields) {
      const value = form.get(field);
      if (value) payload[field] = Number(value);
    }
    const response = await fetch(existing ? `/api/measurements?id=${existing._id}` : "/api/measurements", { method: existing ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    if (response.ok) onSaved(); else setMessage("Add at least one measurement before saving.");
    setLoading(false);
  }

  return <form action={submit} className="flex min-h-0 flex-1 flex-col pb-0">
    <div className="mb-6 shrink-0"><p className="text-sm text-muted">Body measurements</p><h2 className="mt-2 text-2xl font-medium tracking-tight">{format(date, "EEEE, d MMMM yyyy")}</h2></div>
    <div className="measurement-scroll min-h-0 flex-1 space-y-4" style={{ paddingBottom: bottomSpace }}>
      {fields.map((field) => <section id={field} key={field} className="measurement-section workout-exercise-item overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 md:px-5"><h3 className="text-base font-semibold tracking-tight">{labels[field]}</h3></div>
        <div className="px-4 py-2.5 md:px-5"><label className="block text-sm"><span className="sr-only">{labels[field]}</span><input id={`measurement-${field}`} name={field} type="number" step="0.1" value={values[field]} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} placeholder="Enter measurement" className="workout-input" /></label></div>
      </section>)}
    </div>
    <div className="mt-6 flex shrink-0 flex-wrap items-center justify-end gap-3"><Link href="/training?section=calendar&measurement=1" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-purple px-4 text-sm font-medium text-purple transition hover:bg-purple/10">Choose date in Training calendar</Link><button disabled={loading} type="submit" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-purple px-5 text-sm font-semibold text-white shadow-[0_0_24px_hsl(var(--purple)/.2)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60">{loading ? (existing ? "Updating…" : "Saving…") : (existing ? "Update measurement" : "Save measurement")}</button></div>
    {message && <p className="mt-2 text-right text-xs text-negative">{message}</p>}
  </form>;
}
