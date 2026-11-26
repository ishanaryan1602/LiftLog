"use client";

import { useEffect, useState } from "react";
import type { ExerciseTemplate } from "@/features/workouts/data/template";
import { WorkoutBodyMap } from "@/features/workouts/body-map";
import { ExerciseScroll } from "./exercise-scroll";

export function WorkoutExerciseDetails({ exercises, purposes, targets }: { exercises: ExerciseTemplate[]; purposes: Record<string, string>; targets: Record<string, string[]> }) {
  const [selectedId, setSelectedId] = useState<string | null>(exercises[0]?.id ?? null);
  const selectedExercise = exercises.find((exercise) => exercise.id === selectedId) ?? exercises[0];
  const selectedPurpose = selectedExercise ? purposes[selectedExercise.id] ?? "Included to provide balanced, progressive training for this session." : "";

  useEffect(() => {
    const syncSelection = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (exercises.some((exercise) => exercise.id === id)) setSelectedId(id);
    };
    window.addEventListener("workout:select", syncSelection);
    return () => window.removeEventListener("workout:select", syncSelection);
  }, [exercises]);

  return <div className="flex min-h-0 flex-1 flex-col justify-center">
    <div className="workout-details-body-map mb-8"><WorkoutBodyMap exercises={selectedExercise ? [selectedExercise] : []} width={265} /></div>
    <ExerciseScroll>
      {selectedExercise && <section id={selectedExercise.id} key={selectedExercise.id} className="workout-exercise-item workout-selected overflow-hidden rounded-xl">
        <div className="flex flex-col items-center gap-2 py-3 text-center"><div className="w-full min-w-0 lg:w-1/3 lg:min-w-[800px]"><p className="workout-description-copy text-sm leading-6 text-muted">{selectedPurpose}</p><div className="workout-target-pills mt-2 flex flex-wrap justify-center gap-1.5">{(targets[selectedExercise.id] ?? ["Full body"]).map((target) => <span key={target} className="rounded-full border border-line bg-paper/30 px-2 py-1 text-[10px] text-muted">{target}</span>)}</div></div>{selectedExercise.finisher && <span className="shrink-0 rounded-md bg-caution/10 px-2 py-1 text-[10px] text-caution">Finisher</span>}</div>
        {selectedExercise.finisher && <p className="pb-3 text-center text-xs leading-5 text-caution">{selectedExercise.finisher}</p>}
      </section>}
    </ExerciseScroll>
  </div>;
}
