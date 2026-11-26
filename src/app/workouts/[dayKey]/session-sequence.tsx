"use client";

import type { ExerciseTemplate } from "@/features/workouts/data/template";
import { useEffect, useRef, useState } from "react";
import { SectionSidebar } from "@/components/section-sidebar";

export function SessionSequence({ exercises }: { exercises: ExerciseTemplate[] }) {
  const [selectedId, setSelectedId] = useState(exercises[0]?.id ?? "");
  const scrollAnimation = useRef<number | null>(null);
  const programmaticScroll = useRef(false);
  const lastPublishedId = useRef("");
  function publishSelection(id: string) {
    if (lastPublishedId.current === id) return;
    lastPublishedId.current = id;
    window.dispatchEvent(new CustomEvent("workout:select", { detail: id }));
  }

  useEffect(() => {
    function syncSelection(event: Event) {
      const id = (event as CustomEvent<string>).detail;
      if (exercises.some((exercise) => exercise.id === id)) setSelectedId(id);
    }
    window.addEventListener("workout:select", syncSelection);
    return () => window.removeEventListener("workout:select", syncSelection);
  }, [exercises]);

  useEffect(() => {
    const syncHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!exercises.some((exercise) => exercise.id === id)) return;
      setSelectedId(id);
      publishSelection(id);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const target = document.getElementById(id);
        const scrollPane = document.querySelector<HTMLElement>(".workout-exercise-scroll");
        if (!target || !scrollPane) return;
        scrollPane.scrollTop = Math.max(0, scrollPane.scrollTop + target.getBoundingClientRect().top - scrollPane.getBoundingClientRect().top);
      }));
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [exercises]);

  useEffect(() => {
    const scrollPane = document.querySelector<HTMLElement>(".workout-exercise-scroll");
    if (!scrollPane) return;
    const syncSelectionToScroll = () => {
      if (programmaticScroll.current) return;
      const rootTop = scrollPane.getBoundingClientRect().top;
      let activeId = exercises[0]?.id ?? "";
      for (const exercise of exercises) {
        const element = document.getElementById(exercise.id);
        if (element && !element.classList.contains("hidden") && element.getBoundingClientRect().top <= rootTop + 80) activeId = exercise.id;
      }
      if (activeId) { setSelectedId(activeId); publishSelection(activeId); }
    };
    syncSelectionToScroll();
    scrollPane.addEventListener("scroll", syncSelectionToScroll, { passive: true });
    window.addEventListener("resize", syncSelectionToScroll);
    return () => {
      scrollPane.removeEventListener("scroll", syncSelectionToScroll);
      window.removeEventListener("resize", syncSelectionToScroll);
    };
  }, [exercises]);

  function jumpToExercise(id: string) {
    const target = document.getElementById(id);
    if (!target) {
      publishSelection(id);
      setSelectedId(id);
      window.history.replaceState(null, "", `#${id}`);
      return;
    }
    const scrollPane = document.querySelector<HTMLElement>(".workout-exercise-scroll");
    if (scrollPane) {
      if (scrollAnimation.current) cancelAnimationFrame(scrollAnimation.current);
      programmaticScroll.current = true;
      const start = scrollPane.scrollTop;
      const destination = Math.max(0, scrollPane.scrollTop + target.getBoundingClientRect().top - scrollPane.getBoundingClientRect().top);
      const startedAt = performance.now();
      const duration = 280;
      const animate = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        scrollPane.scrollTop = start + (destination - start) * eased;
        if (progress < 1) scrollAnimation.current = requestAnimationFrame(animate);
        else { scrollAnimation.current = null; programmaticScroll.current = false; publishSelection(id); }
      };
      scrollAnimation.current = requestAnimationFrame(animate);
    } else publishSelection(id);
    target.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
    setSelectedId(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  return <SectionSidebar items={exercises.map((exercise) => [exercise.id, exercise.name] as const)} activeId={selectedId} onSelect={jumpToExercise} ariaLabel="Workout exercises" />;
}
