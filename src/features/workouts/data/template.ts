import type { DayKey } from "@/types";
export type ExerciseTemplate = { id: string; name: string; sets: number; notes?: string; finisher?: string };
export const WORKOUT_TEMPLATE: Record<DayKey, { label: string; exercises: ExerciseTemplate[] }> = {
  "push-a": { label: "Push workout", exercises: [{id:"smith-incline-press",name:"Smith Incline Press",sets:2},{id:"machine-flat-press",name:"Machine Flat Press",sets:2},{id:"lateral-raise",name:"Lateral Raise",sets:2},{id:"single-arm-triceps-pushdown",name:"V Bar Tricep Pushdown",sets:3},{id:"cable-crunch",name:"Cable Crunch",sets:2}] },
  "push-b": { label: "Push workout", exercises: [] },
  "pull-a": { label: "Pull workout", exercises: [{id:"lat-pulldown",name:"Lat Pulldown",sets:2},{id:"chest-supported-row",name:"Chest-Supported Row",sets:2},{id:"single-arm-lat-pulldown",name:"Single-Arm Lat Pulldown",sets:2},{id:"reverse-pec-deck",name:"Reverse Pec Deck",sets:2},{id:"barbell-curl",name:"Barbell Curl",sets:3},{id:"reverse-curl",name:"Reverse Curl",sets:2}] },
  "pull-b": { label: "Pull workout", exercises: [] },
  "legs-a": { label: "Leg A workout", exercises: [{id:"db-shoulder-press",name:"DB Shoulder Press",sets:2},{id:"leg-press",name:"Leg Press",sets:2},{id:"leg-curl",name:"Leg Curl",sets:2},{id:"leg-extension",name:"Leg Extension",sets:2},{id:"db-shrugs",name:"DB Shrugs",sets:2},{id:"cable-wrist-curl",name:"Cable Wrist Curl",sets:2}] },
  "legs-b": { label: "Leg B workout", exercises: [{id:"db-shoulder-press",name:"DB Shoulder Press",sets:2},{id:"romanian-deadlift",name:"Romanian Deadlift",sets:2},{id:"leg-extension",name:"Leg Extension",sets:2},{id:"leg-curl",name:"Leg Curl",sets:2},{id:"db-shrugs",name:"DB Shrugs",sets:2},{id:"cable-wrist-curl",name:"Cable Wrist Curl",sets:2}] }
};
WORKOUT_TEMPLATE["push-b"].exercises = WORKOUT_TEMPLATE["push-a"].exercises.map((exercise) => ({ ...exercise }));
WORKOUT_TEMPLATE["pull-b"].exercises = WORKOUT_TEMPLATE["pull-a"].exercises.map((exercise) => ({ ...exercise }));
export function prescribedSetTotal(day: DayKey) { return WORKOUT_TEMPLATE[day].exercises.reduce((total, exercise) => total + exercise.sets, 0); }
