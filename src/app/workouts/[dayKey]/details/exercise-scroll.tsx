"use client";

import { useLayoutEffect, useRef, useState } from "react";

export function ExerciseScroll({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [bottomSpace, setBottomSpace] = useState(0);

  useLayoutEffect(() => {
    const scrollPane = scrollRef.current;
    if (!scrollPane) return;
    const updateBottomSpace = () => {
      const lastExercise = scrollPane.querySelector<HTMLElement>(".workout-exercise-item:last-of-type");
      if (lastExercise) setBottomSpace(Math.max(0, scrollPane.clientHeight - lastExercise.offsetHeight));
    };
    updateBottomSpace();
    const resizeObserver = new ResizeObserver(updateBottomSpace);
    resizeObserver.observe(scrollPane);
    return () => resizeObserver.disconnect();
  }, []);

  return <div ref={scrollRef} className="workout-exercise-scroll workout-details-scroll stagger flex-none space-y-4 overflow-visible" style={{ paddingBottom: bottomSpace }}>{children}</div>;
}
