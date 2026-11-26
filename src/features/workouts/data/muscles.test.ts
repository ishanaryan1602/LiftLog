import { describe, expect, it } from "vitest";
import { muscleHighlightsForExercises } from "./muscles";

const ids = (exercise: string) => muscleHighlightsForExercises([{ id: exercise }]).map((target) => target.id ?? target.group);

describe("exercise muscle targets", () => {
  it("keeps pressing and lateral-raise work on front/side delts", () => {
    expect(ids("lateral-raise")).toEqual(["deltoids"]);
    expect(ids("db-shoulder-press")).toEqual(["deltoids", "triceps"]);
    expect(ids("smith-incline-press")).toEqual(["chest", "deltoids", "triceps"]);
  });

  it("uses rear delts for rowing and reverse-fly work", () => {
    expect(ids("chest-supported-row")).toEqual(["upper_back", "lats", "deltoids_back", "biceps"]);
    expect(ids("reverse-pec-deck")).toEqual(["deltoids_back", "upper_back"]);
  });

  it("keeps lower-body and arm isolation targets specific", () => {
    expect(ids("leg-press")).toEqual(["quads", "glutes"]);
    expect(ids("leg-curl")).toEqual(["hamstrings"]);
    expect(ids("cable-wrist-curl")).toEqual(["forearms"]);
    expect(ids("db-shrugs")).toEqual(["upper_back"]);
  });
});
