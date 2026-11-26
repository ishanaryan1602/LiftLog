"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { MUSCLES, MuscleMap as LibraryMuscleMap } from "js-rich-body-highlighter/react";
import type { ExerciseTemplate } from "./data/template";
import { muscleHighlightsForExercises } from "./data/muscles";

const PRIMARY_ACCENT = "#a21caf";
const BODY_MAP_REGISTRY = MUSCLES;

type MuscleMapProps = ComponentProps<typeof LibraryMuscleMap>;

function GlowingMuscleMap({ className, ...props }: MuscleMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const syncHighlightClasses = () => {
      host.querySelectorAll<SVGPathElement>("[data-muscle-id]").forEach((path) => {
        path.classList.toggle("muscle-map-highlighted", Number(path.style.opacity) > 0);
      });
    };

    syncHighlightClasses();
    const observer = new MutationObserver(syncHighlightClasses);
    observer.observe(host, { subtree: true, attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, []);

  return <div ref={hostRef} className={className}><LibraryMuscleMap registry={BODY_MAP_REGISTRY} {...props} /></div>;
}

export function WorkoutBodyMap({ exercises, compact = false, showBack = true, width = 184 }: { exercises: Pick<ExerciseTemplate, "id">[]; compact?: boolean; showBack?: boolean; width?: number }) {
  const targets = muscleHighlightsForExercises(exercises);
  const highlights = targets.map((target, index) => ({ ...target, intensity: index === 0 ? 84 : 62, color: PRIMARY_ACCENT }));

  if (compact) return <div className="body-map-compact" aria-label="Highlighted muscles"><GlowingMuscleMap className="body-map-svg" gender="male" view="front" theme="light" width={42} height={64} highlights={highlights} color={PRIMARY_ACCENT} blendMode="multiply" hoverHighlight hoverIntensity={28} hoverColor={PRIMARY_ACCENT} /></div>;

  return <section className="body-map-panel" aria-label="Targeted muscle groups">
    <div className="body-map-visual body-map-views"><div className="body-map-view-layer"><GlowingMuscleMap className="body-map-svg" gender="male" view="front" theme="light" width={width} highlights={highlights} color={PRIMARY_ACCENT} blendMode="multiply" hoverHighlight hoverIntensity={34} hoverColor={PRIMARY_ACCENT} /></div>{showBack && <div className="body-map-view-layer"><GlowingMuscleMap className="body-map-svg" gender="male" view="back" theme="light" width={width} highlights={highlights} color={PRIMARY_ACCENT} blendMode="multiply" hoverHighlight hoverIntensity={34} hoverColor={PRIMARY_ACCENT} /></div>}</div>
  </section>;
}
