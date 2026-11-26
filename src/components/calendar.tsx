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
  if (type === "stack") return <svg aria-hidden="true"  viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2.5" width="4" height="4" rx=".7" stroke="currentColor" strokeWidth="1.1" /><rect x="9.5" y="2.5" width="4" height="4" rx=".7" stroke="currentColor" strokeWidth="1.1" /><rect x="2.5" y="9.5" width="4" height="4" rx=".7" stroke="currentColor" strokeWidth="1.1" /><rect x="9.5" y="9.5" width="4" height="4" rx=".7" stroke="currentColor" strokeWidth="1.1" /></svg>;
  return <svg aria-hidden="true"  viewBox="0 0 16 16" fill="none"><path d="M2.5 4h11M2.5 8h11M2.5 12h11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" /></svg>;
}

export function CalendarLayoutToggle({layout,onChange}:{layout:"stack"|"compact";onChange:(layout:"stack"|"compact")=>void}){return <div ><span aria-hidden="true"   />{([["stack","Stack"],["compact","Rows"]] as const).map(([id,label])=><button key={id} type="button" aria-pressed={layout===id} onClick={()=>onChange(id)} ><LayoutIcon type={id}/>{label}</button>)}</div>}

type CalendarMeasurement = { label: string; value: string; logged: boolean };
type CalendarEntry = { date: Date; meta: string; measurements: CalendarMeasurement[] };

function CalendarAgenda({ month, entries, workoutDates, measurementDates, selectedDate, today, transition, onDateSelect }: { month: Date; entries: CalendarEntry[]; workoutDates: Date[]; measurementDates: Date[]; selectedDate?: Date; today: Date; transition: string; onDateSelect?: (date: Date) => void }) {
  const focusDate = selectedDate ?? today;
  const activeDate = isSameMonth(focusDate, month) ? focusDate : startOfMonth(month);
  const monthDays = calendarDays(month).filter((day) => isSameMonth(day, month));
  const orderedDays = [...monthDays.filter((day) => day >= activeDate), ...monthDays.filter((day) => day < activeDate)];

  return <div >
    <div  role="list" aria-label={`${format(month, "MMMM yyyy")} measurement entries`}>
      {orderedDays.map((date, index) => {
        const entry = entries.find((item) => isSameDay(item.date, date));
        const workoutLogged = workoutDates.some((loggedDate) => isSameDay(loggedDate, date));
        const measurementLogged = measurementDates.some((loggedDate) => isSameDay(loggedDate, date));
        const active = isSameDay(date, activeDate);
        const future = isAfter(date, today);
        return <button key={date.toISOString()} type="button" disabled={future} onClick={() => onDateSelect?.(date)}   role="listitem">
          <span >
            <span >{format(date, "d")}</span>
            <span >{format(date, "EEE")}</span>
          </span>
          <span >
            <span ><span>{format(date, "d MMMM yyyy")}</span></span>
            <span ><span ><span  />Workout</span><span ><span  />Measurements</span></span>
            {entry && <span >{entry.measurements.filter((measurement) => measurement.logged).map((measurement) => <span key={measurement.label} >{measurement.label} <span >{measurement.value}</span></span>)}</span>}
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

  return <div  onMouseLeave={() => setHoveredDate(undefined)}>
    <div >
      <button type="button" aria-label="Previous month" onClick={() => { setTransition("previous"); moveMonth("previous"); }} ><svg aria-hidden="true"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m6 14 6-6 6 6" /></svg></button>
      <p >{format(month, "MMMM yyyy")}</p>
      <button type="button" aria-label="Next month" disabled={!canGoForward} onClick={() => { setTransition("next"); moveMonth("next"); }} ><svg aria-hidden="true"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m6 10 6 6 6-6" /></svg></button>
    </div>
    {layout === "compact" ? <CalendarAgenda month={month} entries={entries} workoutDates={workoutDates} measurementDates={measurementDates} selectedDate={selectedDate} today={today} transition={transition} onDateSelect={onDateSelect} /> : <div  >
    <div key={`${format(month, "yyyy-MM")}-${layout}`} ref={gridRef}   role="grid" aria-label={format(month, "MMMM yyyy")}>
      {weekdays.map((weekday) => <div key={weekday}  role="columnheader">{weekday}</div>)}
      {days.map((day, index) => {
        const outside = !isSameMonth(day, month);
        const selected = selectedDate ? isSameDay(day, selectedDate) : false;
        const workoutLogged = workoutDates.some((loggedDate) => isSameDay(day, loggedDate));
        const measurementLogged = measurementDates.some((loggedDate) => isSameDay(day, loggedDate));
        const hovered = hoveredDate ? isSameDay(day, hoveredDate) : false;
        const future = isAfter(day, today);
        return <div key={day.toISOString()}   role="gridcell">
          <button type="button" aria-label={format(day, "d MMMM yyyy")} aria-pressed={selected} disabled={future} onClick={() => onDateSelect?.(day)} onMouseEnter={() => setHoveredDate(day)} onFocus={() => setHoveredDate(day)} >
            <span >{format(day, "d")}</span>
            <span >
              <span aria-label={workoutLogged ? "Workout logged" : undefined}  />
              <span aria-label={measurementLogged ? "Measurement logged" : undefined}  />
            </span>
          </button>
        </div>;
      })}
      {indicatorIndex >= 0 && !indicatorHasEntry && <span aria-hidden="true"   />}
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

  return <div >
    <input type="hidden" name={name} value={value ? format(value, "yyyy-MM-dd") : ""} />
    <button type="button" onClick={toggle} >
      <svg aria-hidden="true"  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect width="15" height="15" x="4.5" y="5.5" rx="2" /><path strokeLinecap="round" d="M8 3.5v4M16 3.5v4M4.5 10h15" /></svg>
      <span>{value ? format(value, "d MMM yyyy") : "Choose a date"}</span>
    </button>
    {open && <div >
      <div >
        <button type="button" aria-label="Previous month" onClick={() => setMonth((current) => subMonths(current, 1))} ><svg aria-hidden="true"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m6 14 6-6 6 6" /></svg></button>
        <span>{format(month, "MMMM yyyy")}</span>
        <button type="button" aria-label="Next month" disabled={!isAfter(today, endOfMonth(month))} onClick={() => setMonth((current) => addMonths(current, 1))} ><svg aria-hidden="true"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m6 10 6 6 6-6" /></svg></button>
      </div>
      <div  role="grid" aria-label={format(month, "MMMM yyyy")}>
        {weekdays.map((weekday) => <div key={weekday}  role="columnheader">{weekday}</div>)}
        {days.map((day) => {
          const selected = draft ? isSameDay(day, draft) : false;
          const outside = !isSameMonth(day, month);
          const future = isAfter(day, today);
          return <div key={day.toISOString()}  role="gridcell">
            <button type="button" aria-label={format(day, "d MMMM yyyy")} aria-pressed={selected} disabled={future} onClick={() => choose(day)} onMouseEnter={() => setHoveredDay(day)} onMouseLeave={() => setHoveredDay(undefined)} onFocus={() => setHoveredDay(day)} onBlur={() => setHoveredDay(undefined)} >
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
          return <span aria-hidden="true"   />;
        })()}
      </div>
    </div>}
  </div>;
}
