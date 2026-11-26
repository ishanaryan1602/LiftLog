"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/calendar";
import { PageHeader } from "@/components/ui";
import { WorkoutList } from "../workouts/workout-list";
import { WorkoutHistory } from "../workouts/history";
import { MeasurementHistory } from "../measurements/history";
import { SectionSidebar } from "@/components/section-sidebar";

type Measurement = { _id: string; measuredAt: string; bodyWeightKg?: number; leftArmCm?: number; rightArmCm?: number; chestCm?: number; waistCm?: number; shouldersCm?: number; leftThighCm?: number; rightThighCm?: number };
type Workout = { _id: string; dayKey: keyof typeof import("@/features/workouts/data/template").WORKOUT_TEMPLATE; startedAt: string; completedAt?: string; exercises: { exerciseId: string; sets: { weight?: number; repetitions?: number; actualRIR?: number }[] }[] };
type LogSection = "workouts" | "workout-history" | "calendar" | "measurement-history";

const sections: [LogSection, string][] = [["calendar", "Calendar"], ["workouts", "Workouts"], ["workout-history", "Workout history"], ["measurement-history", "Measurement history"]];

export default function LogPage() {
  const router = useRouter();
  const [active, setActive] = useState<LogSection>("calendar");
  const [items, setItems] = useState<Measurement[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnWorkout, setReturnWorkout] = useState<string>();
  const [returnMeasurement, setReturnMeasurement] = useState(false);

  function loadMeasurements() {
    setLoading(true);
    Promise.all([fetch("/api/measurements"), fetch("/api/workouts")]).then(async ([measurementsResponse, workoutsResponse]) => { setItems(measurementsResponse.ok ? await measurementsResponse.json() : []); setWorkouts(workoutsResponse.ok ? await workoutsResponse.json() : []); }).catch(() => { setItems([]); setWorkouts([]); }).finally(() => setLoading(false));
  }

  function selectSection(next: LogSection) {
    setActive(next);
    const params = new URLSearchParams(window.location.search);
    params.set("section", next);
    window.history.replaceState(null, "", `/training?${params.toString()}`);
  }

  useEffect(() => {
    const requestedSection = new URLSearchParams(window.location.search).get("section") as LogSection | null;
    const requestedWorkout = new URLSearchParams(window.location.search).get("workout");
    const requestedMeasurement = new URLSearchParams(window.location.search).get("measurement");
    if (requestedSection && sections.some(([id]) => id === requestedSection)) setActive(requestedSection);
    if (requestedWorkout) setReturnWorkout(requestedWorkout);
    if (requestedMeasurement) setReturnMeasurement(true);
    loadMeasurements();
  }, []);

  const markedDates = items.map((item) => parseISO(item.measuredAt));
  const calendarEntries = items.map((item) => {
    const armsLogged = item.leftArmCm != null || item.rightArmCm != null;
    const thighsLogged = item.leftThighCm != null || item.rightThighCm != null;
    const metric = (label: string, value: number | undefined, unit: string) => ({ label, value: value == null ? "—" : `${value} ${unit}`, logged: value != null });
    return { date: parseISO(item.measuredAt), meta: format(parseISO(item.measuredAt), "d MMMM yyyy"), measurements: [metric("Body weight", item.bodyWeightKg, "kg"), metric("Chest", item.chestCm, "cm"), metric("Waist", item.waistCm, "cm"), { label: "Arms", value: armsLogged ? `${item.leftArmCm ?? "—"}/${item.rightArmCm ?? "—"} cm` : "—", logged: armsLogged }, { label: "Thighs", value: thighsLogged ? `${item.leftThighCm ?? "—"}/${item.rightThighCm ?? "—"} cm` : "—", logged: thighsLogged }] };
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  return <div className="training-page flex min-h-0 flex-col">
    <PageHeader eyebrow="Training" title="Training" icon="training" description="Track workouts and measurements from one place." />
    <div className="training-layout grid min-h-0 flex-1 gap-8 md:grid-cols-[13rem_minmax(0,1fr)] md:items-start">
      <SectionSidebar items={sections} activeId={active} onSelect={(id) => selectSection(id as LogSection)} ariaLabel="Log sections" />
      <section aria-label={sections.find(([id]) => id === active)?.[1] ?? "Training"} className="training-content min-w-0">
        <div key={active} className="min-h-64">
          {active === "workouts" && <WorkoutList />}
          {active === "workout-history" && <WorkoutHistory />}
          {active === "calendar" && <Calendar markedDates={markedDates} measurementDates={markedDates} workoutDates={workouts.flatMap((item) => [item.startedAt, item.completedAt].filter((date): date is string => Boolean(date)).map((date) => parseISO(date)))} entries={calendarEntries} onDateSelect={returnWorkout ? (date) => router.push(`/workouts/${returnWorkout}?date=${format(date, "yyyy-MM-dd")}`) : returnMeasurement ? (date) => router.push(`/measurements?date=${format(date, "yyyy-MM-dd")}`) : undefined} />}
          {active === "measurement-history" && <MeasurementHistory />}
          {active === "calendar" && loading && <p className="mt-4 text-sm text-muted">Loading saved measurements…</p>}
        </div>
      </section>
    </div>
  </div>;
}
