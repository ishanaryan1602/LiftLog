"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { addDays, addMonths, endOfMonth, endOfWeek, format, isAfter, isSameDay, isSameMonth, startOfMonth, startOfToday, startOfWeek, subMonths } from "date-fns";

const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function calendarDays(month: Date) {
  const from = startOfWeek(startOfMonth(month));
  const to = endOfWeek(endOfMonth(month));
  const days: Date[] = [];

  for (let day = from; day <= to; day = addDays(day, 1)) days.push(day);
  return days;
}

export type CalendarProps = {
  initialMonth?: Date;
  selectedDate?: Date;
  markedDates?: Date[];
  workoutDates?: Date[];
  measurementDates?: Date[];
  entries?: CalendarEntry[];
  layout?: "stack" | "compact";
  onLayoutChange?: (layout: "stack" | "compact") => void;
  onDateSelect?: (date: Date) => void;
};

function LayoutIcon({ type }: { type: "stack" | "compact" }) {
  if (type === "stack") return <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2.5" width="4" height="4" rx=".7" stroke="currentColor" strokeWidth="1.1" /><rect x="9.5" y="2.5" width="4" height="4" rx=".7" stroke="currentColor" strokeWidth="1.1" /><rect x="2.5" y="9.5" width="4" height="4" rx=".7" stroke="currentColor" strokeWidth="1.1" /><rect x="9.5" y="9.5" width="4" height="4" rx=".7" stroke="currentColor" strokeWidth="1.1" /></svg>;
  return <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none"><path d="M2.5 4h11M2.5 8h11M2.5 12h11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" /></svg>;
}

export function CalendarLayoutToggle({layout,onChange}:{layout:"stack"|"compact";onChange:(layout:"stack"|"compact")=>void}){return <div className="relative grid grid-cols-2 items-center gap-1 rounded-lg border border-line/50 p-1"><span aria-hidden="true" className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-panel shadow-sm transition-transform duration-300 ease-out" style={{transform:layout==="compact"?"translateX(100%)":"translateX(0)"}} />{([["stack","Stack"],["compact","Rows"]] as const).map(([id,label])=><button key={id} type="button" aria-pressed={layout===id} onClick={()=>onChange(id)} className={`relative z-10 inline-flex min-w-20 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] transition ${layout===id?"text-ink":"text-muted hover:text-ink"}`}><LayoutIcon type={id}/>{label}</button>)}</div>}

type CalendarMeasurement = { label: string; value: string; logged: boolean };
type CalendarEntry = { date: Date; meta: string; measurements: CalendarMeasurement[] };

function CalendarAgenda({ month, entries, workoutDates, measurementDates, selectedDate, today, transition, onDateSelect }: { month: Date; entries: CalendarEntry[]; workoutDates: Date[]; measurementDates: Date[]; selectedDate?: Date; today: Date; transition: string; onDateSelect?: (date: Date) => void }) {
  const focusDate = selectedDate ?? today;
  const activeDate = isSameMonth(focusDate, month) ? focusDate : startOfMonth(month);
  const monthDays = calendarDays(month).filter((day) => isSameMonth(day, month));
  const orderedDays = [...monthDays.filter((day) => day >= activeDate), ...monthDays.filter((day) => day < activeDate)];

  return <div className={`calendar-agenda ${transition === "next" ? "month-slide-next" : transition === "previous" ? "month-slide-previous" : "calendar-transition-compact"}`}>
    <div className="max-h-[32rem] overflow-y-auto" role="list" aria-label={`${format(month, "MMMM yyyy")} measurement entries`}>
      {orderedDays.map((date, index) => {
        const entry = entries.find((item) => isSameDay(item.date, date));
        const workoutLogged = workoutDates.some((loggedDate) => isSameDay(loggedDate, date));
        const measurementLogged = measurementDates.some((loggedDate) => isSameDay(loggedDate, date));
        const active = isSameDay(date, activeDate);
        const future = isAfter(date, today);
        return <button key={date.toISOString()} type="button" disabled={future} onClick={() => onDateSelect?.(date)} style={{ animationDelay: `${Math.min(index, 10) * 28}ms` }} className={`calendar-agenda-row group grid w-full grid-cols-[4.5rem_minmax(0,1fr)] gap-4 px-2 py-3 text-left transition ${active ? "text-ink" : "text-muted"} ${future ? "cursor-not-allowed opacity-35" : ""}`} role="listitem">
          <span className={`flex flex-col items-center justify-center py-1 ${active ? "text-purple" : ""}`}>
            <span className="text-xl font-medium leading-none">{format(date, "d")}</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[.12em]">{format(date, "EEE")}</span>
          </span>
          <span className="min-w-0 self-center">
            <span className="flex flex-wrap items-center gap-2 text-sm font-medium"><span>{format(date, "d MMMM yyyy")}</span></span>
            <span className="mt-2 grid gap-1.5 text-[10px] text-muted"><span className="flex items-center gap-1.5"><span className={`h-1.5 rounded-full ${workoutLogged ? "bg-purple" : "bg-line/40"} w-12`} />Workout</span><span className="flex items-center gap-1.5"><span className={`h-1.5 rounded-full ${measurementLogged ? "bg-rose-400" : "bg-line/40"} w-12`} />Measurements</span></span>
            {entry && <span className="mt-2 grid gap-1 text-xs">{entry.measurements.filter((measurement) => measurement.logged).map((measurement) => <span key={measurement.label} className="text-muted">{measurement.label} <span className="tabular-nums">{measurement.value}</span></span>)}</span>}
          </span>
        </button>;
      })}
    </div>
  </div>;
}

/** A reusable month calendar for date-based features across FORM. */
export function Calendar({ initialMonth = startOfToday(), selectedDate, markedDates = [], workoutDates = [], measurementDates = markedDates, entries = [], layout: controlledLayout, onLayoutChange, onDateSelect }: CalendarProps) {
  const [month, setMonth] = useState(startOfMonth(initialMonth));
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>();
  const [internalLayout, setInternalLayout] = useState<"stack" | "compact">("stack");
  const layout = controlledLayout ?? internalLayout;
  const [transition, setTransition] = useState<"stack" | "compact" | "next" | "previous">("stack");
  const previousLayout = useRef(layout);
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridHeight, setGridHeight] = useState<number>();
  const days = calendarDays(month);
  const today = startOfToday();
  const canGoForward = isAfter(today, endOfMonth(month));
  const indicatorDate = hoveredDate ?? selectedDate ?? today;
  const indicatorIndex = indicatorDate ? days.findIndex((day) => isSameDay(day, indicatorDate)) : -1;
  const indicatorColumn = indicatorIndex >= 0 ? indicatorIndex % 7 : -1;
  const indicatorRow = indicatorIndex >= 0 ? Math.floor(indicatorIndex / 7) : -1;
  const indicatorHasEntry = indicatorDate ? workoutDates.some((loggedDate) => isSameDay(loggedDate, indicatorDate)) || measurementDates.some((loggedDate) => isSameDay(loggedDate, indicatorDate)) : false;
  function moveMonth(direction: "next" | "previous") { setMonth((current) => direction === "next" ? addMonths(current, 1) : subMonths(current, 1)); }
  useEffect(() => {
    if (previousLayout.current !== layout) {
      setTransition(layout);
      previousLayout.current = layout;
    }
  }, [layout]);
  useLayoutEffect(() => {
    if (layout === "compact") return;
    const nextHeight = gridRef.current?.scrollHeight;
    if (nextHeight == null) return;
    setGridHeight((current) => current ?? nextHeight);
    const frame = window.requestAnimationFrame(() => setGridHeight(nextHeight));
    return () => window.cancelAnimationFrame(frame);
  }, [month, layout]);

  return <div className="w-full" onMouseLeave={() => setHoveredDate(undefined)}>
    <div className="flex items-center justify-center gap-[4.5rem] pb-[50px] pt-0 sm:gap-24">
      <button type="button" aria-label="Previous month" onClick={() => { setTransition("previous"); moveMonth("previous"); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line/70 text-muted transition hover:border-purple hover:bg-purple/10 hover:text-ink"><svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m6 14 6-6 6 6" /></svg></button>
      <p className="min-w-32 text-center text-sm font-semibold tracking-tight">{format(month, "MMMM yyyy")}</p>
      <button type="button" aria-label="Next month" disabled={!canGoForward} onClick={() => { setTransition("next"); moveMonth("next"); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line/70 text-muted transition hover:border-purple hover:bg-purple/10 hover:text-ink disabled:pointer-events-none disabled:opacity-30"><svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m6 10 6 6 6-6" /></svg></button>
    </div>
    {layout === "compact" ? <CalendarAgenda month={month} entries={entries} workoutDates={workoutDates} measurementDates={measurementDates} selectedDate={selectedDate} today={today} transition={transition} onDateSelect={onDateSelect} /> : <div className="overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(.22,1,.36,1)]" style={{ minHeight: "580px" }}>
    <div key={`${format(month, "yyyy-MM")}-${layout}`} ref={gridRef} style={{ gridTemplateRows: `40px repeat(${Math.ceil(days.length / 7)}, 90px)` }} className={`relative grid grid-cols-7 text-center calendar-transition-${transition === "next" || transition === "previous" ? transition : layout} ${transition==="next"?"month-slide-next":transition==="previous"?"month-slide-previous":""}`} role="grid" aria-label={format(month, "MMMM yyyy")}>
      {weekdays.map((weekday) => <div key={weekday} className="flex h-10 items-center justify-center text-[10px] font-semibold uppercase tracking-[.14em] text-muted" role="columnheader">{weekday}</div>)}
      {days.map((day, index) => {
        const outside = !isSameMonth(day, month);
        const selected = selectedDate ? isSameDay(day, selectedDate) : false;
        const workoutLogged = workoutDates.some((loggedDate) => isSameDay(day, loggedDate));
        const measurementLogged = measurementDates.some((loggedDate) => isSameDay(day, loggedDate));
        const hovered = hoveredDate ? isSameDay(day, hoveredDate) : false;
        const future = isAfter(day, today);
        return <div key={day.toISOString()} style={{ animationDelay: `${Math.min(index, 35) * 12}ms` }} className="calendar-grid-cell flex min-h-[23px] justify-center p-1" role="gridcell">
          <button type="button" aria-label={format(day, "d MMMM yyyy")} aria-pressed={selected} disabled={future} onClick={() => onDateSelect?.(day)} onMouseEnter={() => setHoveredDate(day)} onFocus={() => setHoveredDate(day)} className={`group relative flex min-h-[19px] h-full w-full flex-col items-center justify-start rounded-lg pt-2 text-sm transition ${selected ? "font-semibold text-ink" : "text-ink"} ${outside ? "text-muted/35" : ""} ${future ? "cursor-not-allowed opacity-35" : ""}`}>
            <span className="flex h-8 w-8 items-center justify-center">{format(day, "d")}</span>
            <span className={`${layout === "stack" ? "mt-1" : "mt-4"} flex h-[3px] items-center justify-center gap-1`}>
              <span aria-label={workoutLogged ? "Workout logged" : undefined} className={`h-[3px] rounded-full ${workoutLogged ? "bg-purple" : "bg-transparent"} ${workoutLogged ? (measurementLogged ? "w-3" : "w-6") : "w-0"}`} />
              <span aria-label={measurementLogged ? "Measurement logged" : undefined} className={`h-[3px] rounded-full ${measurementLogged ? "bg-rose-400" : "bg-transparent"} ${measurementLogged ? (workoutLogged ? "w-3" : "w-6") : "w-0"}`} />
            </span>
          </button>
        </div>;
      })}
      {indicatorIndex >= 0 && !indicatorHasEntry && <span aria-hidden="true" className="pointer-events-none absolute h-[3px] w-6 rounded-full bg-purple transition-all duration-500 ease-out will-change-[left,top]" style={{ left: `${((indicatorColumn + 0.5) / 7) * 100}%`, top: `${40 + indicatorRow * 90 + 44}px`, transform: "translateX(-50%)" }} />}
    </div>
    </div>}
  </div>;
}

export function CalendarField({ name = "measuredAt", initial }: { name?: string; initial?: string }) {
  const initialDate = initial ? new Date(`${initial}T12:00:00`) : startOfToday();
  const [value, setValue] = useState<Date | undefined>(initialDate);
  const [draft, setDraft] = useState<Date | undefined>(initialDate);
  const [month, setMonth] = useState(initialDate);
  const [hoveredDay, setHoveredDay] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);
  const days = calendarDays(month);
  const today = startOfToday();

  function choose(next: Date) {
    if (isAfter(next, today)) return;
    setDraft(next);
    setValue(next);
    setMonth(next);
    setHoveredDay(undefined);
    setOpen(false);
  }

  function toggle() {
    setDraft(value);
    setMonth(value ?? startOfToday());
    setOpen((current) => !current);
  }

  return <div className="relative">
    <input type="hidden" name={name} value={value ? format(value, "yyyy-MM-dd") : ""} />
    <button type="button" onClick={toggle} className="flex h-11 w-full items-center justify-between rounded-xl border border-line bg-panel px-3 py-2.5 text-left text-sm text-ink outline-none transition hover:border-purple focus:border-purple focus:ring-2 focus:ring-purple/15">
      <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect width="15" height="15" x="4.5" y="5.5" rx="2" /><path strokeLinecap="round" d="M8 3.5v4M16 3.5v4M4.5 10h15" /></svg>
      <span>{value ? format(value, "d MMM yyyy") : "Choose a date"}</span>
    </button>
    {open && <div className="calendar-popover absolute left-0 right-0 z-30 mt-2 w-full rounded-2xl border border-line p-4">
      <div className="relative flex h-8 items-center justify-center text-xs font-semibold text-ink">
        <button type="button" aria-label="Previous month" onClick={() => setMonth((current) => subMonths(current, 1))} className="absolute left-0 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-purple/10 hover:text-ink"><svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m6 14 6-6 6 6" /></svg></button>
        <span>{format(month, "MMMM yyyy")}</span>
        <button type="button" aria-label="Next month" disabled={!isAfter(today, endOfMonth(month))} onClick={() => setMonth((current) => addMonths(current, 1))} className="absolute right-0 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-purple/10 hover:text-ink disabled:pointer-events-none disabled:opacity-30"><svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m6 10 6 6 6-6" /></svg></button>
      </div>
      <div className="relative mt-5 grid grid-cols-7 text-center" role="grid" aria-label={format(month, "MMMM yyyy")}>
        {weekdays.map((weekday) => <div key={weekday} className="flex h-8 items-center justify-center p-1 text-[10px] font-medium text-muted" role="columnheader">{weekday}</div>)}
        {days.map((day) => {
          const selected = draft ? isSameDay(day, draft) : false;
          const outside = !isSameMonth(day, month);
          const future = isAfter(day, today);
          return <div key={day.toISOString()} className="flex h-8 justify-center p-0" role="gridcell">
            <button type="button" aria-label={format(day, "d MMMM yyyy")} aria-pressed={selected} disabled={future} onClick={() => choose(day)} onMouseEnter={() => setHoveredDay(day)} onMouseLeave={() => setHoveredDay(undefined)} onFocus={() => setHoveredDay(day)} onBlur={() => setHoveredDay(undefined)} className={`relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-xs transition ${selected ? "font-semibold text-ink" : "text-ink"} ${outside ? "text-muted/40" : ""} ${future ? "cursor-not-allowed opacity-40" : ""}`}>
              <span>{format(day, "d")}</span>
            </button>
          </div>;
        })}
        {(() => {
          const indicatorDay = hoveredDay ?? draft;
          const indicatorIndex = indicatorDay ? days.findIndex((day) => isSameDay(day, indicatorDay)) : -1;
          if (indicatorIndex < 0) return null;
          const column = indicatorIndex % 7;
          const row = Math.floor(indicatorIndex / 7);
          return <span aria-hidden="true" className="pointer-events-none absolute h-1 w-1 rounded-full bg-purple transition-[left,top] duration-200 ease-out" style={{ left: `${((column + 0.5) / 7) * 100}%`, top: `${32 + row * 32 + 25}px`, transform: "translateX(-50%)" }} />;
        })()}
      </div>
    </div>}
  </div>;
}
