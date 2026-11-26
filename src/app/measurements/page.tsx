"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { MeasurementForm } from "./measurement-form";
import { DetailLayout } from "@/components/detail-layout";
import { MeasurementSequence } from "./measurement-sequence";

type Measurement = { _id: string; measuredAt: string; bodyWeightKg?: number; leftArmCm?: number; rightArmCm?: number; chestCm?: number; waistCm?: number; shouldersCm?: number; leftThighCm?: number; rightThighCm?: number };

export default function Measurements() {
  const [items, setItems] = useState<Measurement[]>([]);
  const [date, setDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const dateKey = format(date, "yyyy-MM-dd");
  const existing = useMemo(() => items.find((item) => item.measuredAt.slice(0, 10) === dateKey), [dateKey, items]);

  function load() { setLoading(true); fetch("/api/measurements").then((response) => response.ok ? response.json() : []).then(setItems).catch(() => setItems([])).finally(() => setLoading(false)); }
  useEffect(() => { const requestedDate = new URLSearchParams(window.location.search).get("date"); if (requestedDate) setDate(parseISO(requestedDate)); load(); }, []);

  return <DetailLayout backHref="/training" backLabel="Training" breadcrumbSection="Measurement" breadcrumbSectionHref="/training?section=measurement-history" currentLabel="Measurements" breadcrumbTail={format(date, "d MMM yyyy")} scrollable showHeader={false} sidebar={<MeasurementSequence />}><MeasurementForm key={`${dateKey}-${existing?._id ?? "new"}`} date={date} existing={existing} onSaved={() => { load(); }} /></DetailLayout>;
}
