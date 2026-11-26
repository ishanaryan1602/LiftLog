"use client";

import type { ComponentProps } from "react";
import { MUSCLES, MuscleMap as LibraryMuscleMap } from "js-rich-body-highlighter/react";
import type { ExerciseTemplate } from "./data/template";
import { muscleHighlightsForExercises } from "./data/muscles";

const PRIMARY_ACCENT = "#a21caf";
const BODY_MAP_REGISTRY = MUSCLES;

type MuscleMapProps = ComponentProps<typeof LibraryMuscleMap>;

function GlowingMuscleMap(props: MuscleMapProps) {
  return <div><LibraryMuscleMap registry={BODY_MAP_REGISTRY} {...props} /></div>;
}

export function WorkoutBodyMap({ exercises, compact = false, showBack = true, width = 184 }: { exercises: Pick<ExerciseTemplate, "id">[]; compact?: boolean; showBack?: boolean; width?: number }) {
  const targets = muscleHighlightsForExercises(exercises);
  const highlights = targets.map((target, index) => ({ ...target, intensity: index === 0 ? 84 : 62, color: PRIMARY_ACCENT }));

  if (compact) return <div  aria-label="Highlighted muscles"><GlowingMuscleMap  gender="male" view="front" theme="light" width={42} height={64} highlights={highlights} color={PRIMARY_ACCENT} blendMode="multiply" hoverHighlight hoverIntensity={28} hoverColor={PRIMARY_ACCENT} /></div>;

  return <section  aria-label="Targeted muscle groups">
    <div ><div ><GlowingMuscleMap  gender="male" view="front" theme="light" width={width} highlights={highlights} color={PRIMARY_ACCENT} blendMode="multiply" hoverHighlight hoverIntensity={34} hoverColor={PRIMARY_ACCENT} /></div>{showBack && <div ><GlowingMuscleMap  gender="male" view="back" theme="light" width={width} highlights={highlights} color={PRIMARY_ACCENT} blendMode="multiply" hoverHighlight hoverIntensity={34} hoverColor={PRIMARY_ACCENT} /></div>}</div>
  </section>;
}
