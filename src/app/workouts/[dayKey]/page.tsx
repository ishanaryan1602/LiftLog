import { notFound } from "next/navigation";
import { format } from "date-fns";
import { WORKOUT_TEMPLATE, prescribedSetTotal } from "@/features/workouts/data/template";
import { SessionForm } from "./session-form";
import { SessionSequence } from "./session-sequence";
import { DetailLayout } from "@/components/detail-layout";

export default async function WorkoutDetail({ params, searchParams }: { params: Promise<{ dayKey: string }>; searchParams: Promise<{ date?: string; edit?: string }> }) {
  const { dayKey } = await params;
  const { date, edit } = await searchParams;
  const day = WORKOUT_TEMPLATE[dayKey as keyof typeof WORKOUT_TEMPLATE];
  if (!day) notFound();
  const totalSets = prescribedSetTotal(dayKey as keyof typeof WORKOUT_TEMPLATE);

  const workoutDate = date ? new Date(`${date}T12:00:00`) : new Date();
  return <DetailLayout backHref="/training" backLabel="Training" breadcrumbSection="Workouts" breadcrumbSectionHref="/training?section=workouts" currentLabel={day.label} breadcrumbTail={format(workoutDate, "d MMM yyyy")} scrollable showHeader={false} sidebar={<SessionSequence exercises={day.exercises} />}><SessionForm dayKey={dayKey} exercises={day.exercises} selectedDate={date} editId={edit} /></DetailLayout>;
}
