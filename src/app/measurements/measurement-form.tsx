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

  return <form action={submit} >
    <div ><p >Body measurements</p><h2 >{format(date, "EEEE, d MMMM yyyy")}</h2></div>
    <div  >
      {fields.map((field) => <section id={field} key={field} >
        <div ><h3 >{labels[field]}</h3></div>
        <div ><label ><span >{labels[field]}</span><input id={`measurement-${field}`} name={field} type="number" step="0.1" value={values[field]} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} placeholder="Enter measurement"  /></label></div>
      </section>)}
    </div>
    <div ><Link href="/training?section=calendar&measurement=1" >Choose date in Training calendar</Link><button disabled={loading} type="submit" >{loading ? (existing ? "Updating…" : "Saving…") : (existing ? "Update measurement" : "Save measurement")}</button></div>
    {message && <p >{message}</p>}
  </form>;
}
