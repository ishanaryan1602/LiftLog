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

  if (loading) return <div ><div ><span  />Loading records…</div></div>;
  if (groups.length === 0) return <div ><div ><h2 >Workout history</h2><Link href="/workouts/push-a" >Log workout</Link></div><p >No workouts logged yet. Completed sessions will appear here.</p></div>;

  return <div >
    <div ><h2 >Workout history</h2><Link href="/workouts/push-a" >Log workout</Link></div>
    <nav ref={monthNavRef} aria-label="Workout history months" ><span aria-hidden="true"   /><button ref={(button) => { monthButtonRefs.current[0] = button; }} type="button" onClick={() => setActiveMonth(null)} >All Months</button>{groups.map((group, index) => <button ref={(button) => { monthButtonRefs.current[index + 1] = button; }} type="button" key={group.key} onClick={() => setActiveMonth(group.key)} >{group.label}</button>)}</nav>
    <div ><div key={displayedMonth ?? "all"} >
      {visibleGroups.map((group) => <section key={group.key} ><h3 >{group.label}</h3><div >{group.items.map((item, index) => { const detailHref = `/workouts/${item.dayKey}/history/${item._id}`; return <article key={item._id}  ><div ><span ><Dumbbell  strokeWidth={1.5} aria-hidden="true" /></span><div ><p >{format(parseISO(item.startedAt), "d MMMM yyyy")}</p><p >{item.dayKey.replace("-", " ")} · {item.exercises.length} exercises · {item.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)} sets</p><div ><Link href={detailHref as Route} >View</Link><button onClick={() => remove(item._id)} >Delete</button></div></div></div></article>; })}</div></section>)}
    </div></div>
  </div>;
}
