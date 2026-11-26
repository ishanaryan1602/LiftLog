"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";

type Measurement = { _id: string; measuredAt: string; bodyWeightKg?: number; leftArmCm?: number; rightArmCm?: number; chestCm?: number; waistCm?: number; shouldersCm?: number; leftThighCm?: number; rightThighCm?: number };

function DumbbellIcon() { return <svg aria-hidden="true"  viewBox="0 0 16 16" fill="none"><path d="M5.5 4v8M3.5 5.5v5M2 6.5v3M10.5 4v8M12.5 5.5v5M14 6.5v3M5.5 8h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" /></svg>; }
function paired(left: number | undefined, right: number | undefined, unit: string) { return left == null && right == null ? undefined : `${left ?? "—"}/${right ?? "—"} ${unit}`; }
function summary(item: Measurement) { return [item.bodyWeightKg != null ? `Body weight ${item.bodyWeightKg} kg` : undefined, item.waistCm != null ? `Waist ${item.waistCm} cm` : undefined, item.chestCm != null ? `Chest ${item.chestCm} cm` : undefined, item.shouldersCm != null ? `Shoulders ${item.shouldersCm} cm` : undefined, paired(item.leftArmCm, item.rightArmCm, "cm") ? `Arms ${paired(item.leftArmCm, item.rightArmCm, "cm")}` : undefined, paired(item.leftThighCm, item.rightThighCm, "cm") ? `Thighs ${paired(item.leftThighCm, item.rightThighCm, "cm")}` : undefined].filter((value): value is string => Boolean(value)).join("  ·  "); }

export function MeasurementHistory({ refreshKey = 0 }: { refreshKey?: number }) {
  const [items, setItems] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const [displayedMonth, setDisplayedMonth] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState<"idle" | "out" | "in">("idle");
  const monthNavRef = useRef<HTMLElement>(null);
  const monthButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [monthIndicator, setMonthIndicator] = useState(0);

  useEffect(() => { let cancelled = false; let revealTimer: number | undefined; const started = Date.now(); const finish = (next: Measurement[]) => { const wait = Math.max(0, 650 - (Date.now() - started)); revealTimer = window.setTimeout(() => { if (!cancelled) { setItems(next); setLoading(false); } }, wait); }; setLoading(true); fetch("/api/measurements").then((response) => response.ok ? response.json() : []).then(finish).catch(() => finish([])); return () => { cancelled = true; if (revealTimer != null) window.clearTimeout(revealTimer); }; }, [refreshKey]);
  async function remove(id: string) { if (!confirm("Delete this measurement?")) return; await fetch(`/api/measurements?id=${id}`, { method: "DELETE" }); setItems((current) => current.filter((item) => item._id !== id)); }
  const groups = useMemo(() => { const sorted = [...items].sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()); return Array.from(sorted.reduce((map, item) => { const date = parseISO(item.measuredAt); const key = format(date, "yyyy-MM"); const group = map.get(key) ?? { key, label: format(date, "MMMM yyyy"), items: [] as Measurement[] }; group.items.push(item); map.set(key, group); return map; }, new Map<string, { key: string; label: string; items: Measurement[] }>()).values()); }, [items]);
  useEffect(() => {
    if (displayedMonth === activeMonth) return;
    setFilterPhase("out");
    const timer = window.setTimeout(() => {
      setDisplayedMonth(activeMonth);
      setFilterPhase("in");
      window.setTimeout(() => setFilterPhase("idle"), 260);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [activeMonth, displayedMonth]);

  const visibleGroups = displayedMonth ? groups.filter((group) => group.key === displayedMonth) : groups;
  const activeMonthIndex = activeMonth === null ? 0 : groups.findIndex((group) => group.key === activeMonth) + 1;
  useLayoutEffect(() => { const nav = monthNavRef.current; const button = monthButtonRefs.current[activeMonthIndex]; if (!nav || !button) return; setMonthIndicator(button.offsetLeft + button.offsetWidth / 2 - 12); }, [activeMonthIndex, groups.length, loading]);

  if (loading) return <div ><div ><span  />Loading records…</div></div>;
  return <div >{groups.length === 0 ? <div ><div ><h2 >Measurement history</h2><Link href="/measurements" >Log measurement</Link></div><p >No measurements yet. Your saved check-ins will appear here.</p></div> : <><div ><h2 >Measurement history</h2><Link href="/measurements" >Log measurement</Link></div><nav ref={monthNavRef} aria-label="History months" ><span aria-hidden="true"   /><button ref={(button) => { monthButtonRefs.current[0] = button; }} type="button" aria-pressed={activeMonth === null} onClick={() => setActiveMonth(null)} >All Months</button>{groups.map((group, index) => <button ref={(button) => { monthButtonRefs.current[index + 1] = button; }} key={group.key} type="button" aria-pressed={activeMonth === group.key} onClick={() => setActiveMonth(group.key)} >{group.label}</button>)}</nav><div ><div key={displayedMonth ?? "all"} >{visibleGroups.map((group) => <section key={group.key} ><h3 >{group.label}</h3><div >{group.items.map((item, index) => <article key={item._id}  ><div ><span ><DumbbellIcon /></span><div ><p >{format(parseISO(item.measuredAt), "d MMMM yyyy")}</p><p >{summary(item)}</p><div ><Link href={`/measurements?date=${item.measuredAt.slice(0, 10)}`} >Edit</Link><button onClick={() => remove(item._id)} >Delete</button></div></div></div></article>)}</div></section>)}</div></div></>}</div>;
}
