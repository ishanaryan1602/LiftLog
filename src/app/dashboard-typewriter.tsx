"use client";
import { useEffect, useState } from "react";

const phrases = ["work visible.", "progress visible.", "consistency visible."];

export function DashboardTypewriter() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState(phrases[0]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIndex];
    const finishedTyping = !deleting && text === current;
    const finishedDeleting = deleting && text.length === 0;
    const delay = finishedTyping ? 1500 : finishedDeleting ? 350 : deleting ? 45 : 75;
    const timer = window.setTimeout(() => {
      if (finishedTyping) {
        setDeleting(true);
      } else if (finishedDeleting) {
        setPhraseIndex((index) => (index + 1) % phrases.length);
        setDeleting(false);
      } else if (deleting) {
        setText(text.slice(0, -1));
      } else {
        setText(current.slice(0, text.length + 1));
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [deleting, phraseIndex, text]);

  return <span aria-live="polite">{text}<span aria-hidden="true"  /></span>;
}
