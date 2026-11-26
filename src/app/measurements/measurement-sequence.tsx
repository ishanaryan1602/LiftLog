"use client";

import { useEffect, useRef, useState } from "react";
import { SectionSidebar } from "@/components/section-sidebar";

const bodyParts = [
  ["bodyWeightKg", "Body weight"], ["leftArmCm", "Left arm"], ["rightArmCm", "Right arm"], ["chestCm", "Chest"],
  ["waistCm", "Waist"], ["shouldersCm", "Shoulders"], ["leftThighCm", "Left thigh"], ["rightThighCm", "Right thigh"],
] as const;
type BodyPartId = typeof bodyParts[number][0];

export function MeasurementSequence() {
  const [selected, setSelected] = useState<BodyPartId>(bodyParts[0][0]);
  const scrollAnimation = useRef<number | null>(null);

  useEffect(() => {
    const scrollPane = document.querySelector<HTMLElement>(".measurement-scroll");
    if (!scrollPane) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setSelected((visible.target as HTMLElement).id as BodyPartId);
    }, { root: scrollPane, threshold: [0.35, 0.6, 0.85] });
    bodyParts.forEach(([id]) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    function selectPart(event: Event) { setSelected((event as CustomEvent<BodyPartId>).detail); }
    window.addEventListener("measurement:select", selectPart);
    return () => { observer.disconnect(); window.removeEventListener("measurement:select", selectPart); };
  }, []);

  function focusPart(id: string) {
    const bodyPart = id as BodyPartId;
    const target = document.getElementById(id);
    const scrollPane = document.querySelector<HTMLElement>(".measurement-scroll");
    if (target && scrollPane) {
      if (scrollAnimation.current) cancelAnimationFrame(scrollAnimation.current);
      const start = scrollPane.scrollTop;
      const destination = Math.max(0, target.getBoundingClientRect().top - scrollPane.getBoundingClientRect().top + start);
      const startedAt = performance.now();
      const animate = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / 520);
        const eased = 1 - Math.pow(1 - progress, 3);
        scrollPane.scrollTop = start + (destination - start) * eased;
        if (progress < 1) scrollAnimation.current = requestAnimationFrame(animate); else scrollAnimation.current = null;
      };
      scrollAnimation.current = requestAnimationFrame(animate);
      target.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
    }
    setSelected(bodyPart);
    window.dispatchEvent(new CustomEvent("measurement:select", { detail: bodyPart }));
  }
  return <SectionSidebar items={bodyParts} activeId={selected} onSelect={focusPart} ariaLabel="Measurement fields" />;
}
