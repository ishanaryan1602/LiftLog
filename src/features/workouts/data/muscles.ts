import type { ExerciseTemplate } from "./template";

export type MuscleGroup = "chest" | "shoulders" | "biceps" | "triceps" | "forearms" | "abs" | "upper_back" | "lats" | "lower_back" | "glutes" | "quads" | "hamstrings" | "calves" | "obliques";

export type MuscleTarget = { id?: string; group?: MuscleGroup };

const exerciseMuscles: Record<string, MuscleGroup[]> = {
  "smith-incline-press": ["chest", "shoulders", "triceps"],
  "machine-flat-press": ["chest", "shoulders", "triceps"],
  "pec-deck-fly": ["chest"],
  "lateral-raise": ["shoulders"],
  "single-arm-triceps-pushdown": ["triceps"],
  "cable-crunch": ["abs"],
  "lat-pulldown": ["lats", "biceps"],
  "chest-supported-row": ["upper_back", "lats", "shoulders"],
  "single-arm-lat-pulldown": ["lats", "biceps"],
  "reverse-pec-deck": ["shoulders", "upper_back"],
  "barbell-curl": ["biceps"],
  "reverse-curl": ["biceps", "forearms"],
  "db-shoulder-press": ["shoulders", "triceps"],
  "leg-press": ["quads", "glutes"],
  "leg-curl": ["hamstrings"],
  "leg-extension": ["quads"],
  "db-shrugs": ["upper_back", "shoulders"],
  "cable-wrist-curl": ["forearms"],
  "romanian-deadlift": ["hamstrings", "glutes", "lower_back"],
};

const exerciseTargets: Record<string, MuscleTarget[]> = {
  "smith-incline-press": [{ group: "chest" }, { id: "deltoids" }, { group: "triceps" }],
  "machine-flat-press": [{ group: "chest" }, { id: "deltoids" }, { group: "triceps" }],
  "pec-deck-fly": [{ group: "chest" }],
  "lateral-raise": [{ id: "deltoids" }],
  "single-arm-triceps-pushdown": [{ group: "triceps" }],
  "cable-crunch": [{ group: "abs" }],
  "lat-pulldown": [{ group: "lats" }, { group: "biceps" }],
  "chest-supported-row": [{ group: "upper_back" }, { group: "lats" }, { id: "deltoids_back" }, { group: "biceps" }],
  "single-arm-lat-pulldown": [{ group: "lats" }, { group: "biceps" }],
  "reverse-pec-deck": [{ id: "deltoids_back" }, { group: "upper_back" }],
  "barbell-curl": [{ group: "biceps" }],
  "reverse-curl": [{ group: "biceps" }, { group: "forearms" }],
  "db-shoulder-press": [{ id: "deltoids" }, { group: "triceps" }],
  "leg-press": [{ group: "quads" }, { group: "glutes" }],
  "leg-curl": [{ group: "hamstrings" }],
  "leg-extension": [{ group: "quads" }],
  "db-shrugs": [{ group: "upper_back" }],
  "cable-wrist-curl": [{ group: "forearms" }],
  "romanian-deadlift": [{ group: "hamstrings" }, { group: "glutes" }, { group: "lower_back" }],
};

export function muscleGroupsForExercises(exercises: Pick<ExerciseTemplate, "id">[]) {
  return Array.from(new Set(exercises.flatMap((exercise) => exerciseMuscles[exercise.id] ?? [])));
}

export function muscleHighlightsForExercises(exercises: Pick<ExerciseTemplate, "id">[]) {
  const targets = exercises.flatMap((exercise) => {
    return exerciseTargets[exercise.id] ?? (exerciseMuscles[exercise.id] ?? []).map((group) => ({ group }));
  });

  return Array.from(new Map(targets.map((target) => [`${target.id ?? "group"}:${target.group ?? ""}`, target])).values());
}
