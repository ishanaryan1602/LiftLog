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

  return <div >
    <div ><WorkoutBodyMap exercises={selectedExercise ? [selectedExercise] : []} width={265} /></div>
    <ExerciseScroll>
      {selectedExercise && <section id={selectedExercise.id} key={selectedExercise.id} >
        <div ><div ><p >{selectedPurpose}</p><div >{(targets[selectedExercise.id] ?? ["Full body"]).map((target) => <span key={target} >{target}</span>)}</div></div>{selectedExercise.finisher && <span >Finisher</span>}</div>
        {selectedExercise.finisher && <p >{selectedExercise.finisher}</p>}
      </section>}
    </ExerciseScroll>
  </div>;
}
