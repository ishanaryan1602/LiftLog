"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { Dumbbell } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

type Session = { _id: string; dayKey: string; startedAt: string; exercises: { sets: { weight: number; repetitions: number }[] }[] };

export function WorkoutHistory() {
  const [items, setItems] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const [displayedMonth, setDisplayedMonth] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState<"idle" | "out" | "in">("idle");
  const monthNavRef = useRef<HTMLElement>(null);
  const monthButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [monthIndicator, setMonthIndicator] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let revealTimer: number | undefined;
    const started = Date.now();
    const finish = (next: Session[]) => {
      const wait = Math.max(0, 650 - (Date.now() - started));
      revealTimer = window.setTimeout(() => { if (!cancelled) { setItems(next); setLoading(false); } }, wait);
    };
    fetch("/api/workouts").then((response) => response.ok ? response.json() : []).then(finish).catch(() => finish([]));
    return () => { cancelled = true; if (revealTimer != null) window.clearTimeout(revealTimer); };
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this workout?")) return;
    await fetch(`/api/workouts?id=${id}`, { method: "DELETE" });
    setItems((current) => current.filter((item) => item._id !== id));
  }

  const groups = useMemo(() => {
    const sorted = [...items].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
    return Array.from(sorted.reduce((map, item) => {
      const date = parseISO(item.startedAt);
      const key = format(date, "yyyy-MM");
      const group = map.get(key) ?? { key, label: format(date, "MMMM yyyy"), items: [] as Session[] };
      group.items.push(item);
      map.set(key, group);
      return map;
    }, new Map<string, { key: string; label: string; items: Session[] }>()).values());
  }, [items]);

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

  useLayoutEffect(() => {
    const nav = monthNavRef.current;
    const button = monthButtonRefs.current[activeMonthIndex];
    if (!nav || !button) return;
    setMonthIndicator(button.offsetLeft + button.offsetWidth / 2 - 12);
  }, [activeMonthIndex, groups.length]);

  if (loading) return <div className="pt-2 text-left"><div className="flex items-center gap-3 text-sm text-muted"><span className="h-2 w-2 animate-pulse rounded-full bg-purple" />Loading records…</div></div>;
  if (groups.length === 0) return <div className="history-view history-empty-state pt-2 text-left"><div className="history-empty-heading flex flex-wrap items-center justify-between gap-4"><h2 className="text-xl font-medium">Workout history</h2><Link href="/workouts/push-a" className="inline-flex h-10 items-center justify-center rounded-xl bg-purple px-4 text-sm font-semibold text-white transition hover:brightness-110">Log workout</Link></div><p className="mt-3 text-sm leading-6 text-muted">No workouts logged yet. Completed sessions will appear here.</p></div>;

  return <div className="history-view pt-2 text-left">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h2 className="text-xl font-medium">Workout history</h2><Link href="/workouts/push-a" className="inline-flex h-10 items-center justify-center rounded-xl bg-purple px-4 text-sm font-semibold text-white transition hover:brightness-110">Log workout</Link></div>
    <nav ref={monthNavRef} aria-label="Workout history months" className="relative flex flex-wrap gap-x-5 gap-y-3"><span aria-hidden="true" className="pointer-events-none absolute bottom-0 h-[3px] w-6 rounded-full bg-purple transition-[left] duration-300 ease-out" style={{ left: monthIndicator }} /><button ref={(button) => { monthButtonRefs.current[0] = button; }} type="button" onClick={() => setActiveMonth(null)} className={`relative pb-3 pt-1 text-xs transition hover:text-ink ${activeMonth === null ? "text-ink" : "text-muted"}`}>All Months</button>{groups.map((group, index) => <button ref={(button) => { monthButtonRefs.current[index + 1] = button; }} type="button" key={group.key} onClick={() => setActiveMonth(group.key)} className={`relative pb-3 pt-1 text-xs transition hover:text-ink ${activeMonth === group.key ? "text-ink" : "text-muted"}`}>{group.label}</button>)}</nav>
    <div className="history-scroll mt-5 min-h-0 flex-1 overflow-y-auto"><div key={displayedMonth ?? "all"} className={`history-timeline history-filter-${filterPhase} relative space-y-12 pl-8 before:absolute before:bottom-0 before:left-3 before:top-1 before:border-l-2 before:border-dotted before:border-purple/70`}>
      {visibleGroups.map((group) => <section key={group.key} className="relative before:absolute before:-left-[25px] before:top-2.5 before:h-3 before:w-3 before:rounded-full before:border-2 before:border-purple before:bg-paper"><h3 className="history-month-heading text-2xl font-medium tracking-tight">{group.label}</h3><div className="mt-6 space-y-6">{group.items.map((item, index) => { const detailHref = `/workouts/${item.dayKey}/history/${item._id}`; return <article key={item._id} style={{ animationDelay: `${80 + Math.min(index, 7) * 45}ms` }} className="history-entry-stagger relative"><div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-muted"><Dumbbell className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" /></span><div className="min-w-0"><p className="text-sm font-medium text-ink">{format(parseISO(item.startedAt), "d MMMM yyyy")}</p><p className="mt-2 text-sm leading-6 text-muted">{item.dayKey.replace("-", " ")} · {item.exercises.length} exercises · {item.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)} sets</p><div className="mt-3 flex items-center gap-4"><Link href={detailHref as Route} className="text-xs text-muted transition hover:text-ink">View</Link><button onClick={() => remove(item._id)} className="text-xs text-negative transition hover:text-purple">Delete</button></div></div></div></article>; })}</div></section>)}
    </div></div>
  </div>;
}
