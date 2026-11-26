"use client";
import { useEffect, useState } from "react";
import { ThemeSettings } from "@/components/theme-settings";
import { PageHeader } from "@/components/ui";
import { SectionSidebar } from "@/components/section-sidebar";

const settingsSections = [["program", "Program"], ["appearance", "Appearance"], ["backup", "Backup & restore"]] as const;

export default function Settings() {
  const [active, setActive] = useState("program");
  useEffect(() => { const hash = window.location.hash.slice(1); if (settingsSections.some(([id]) => id === hash)) setActive(hash); }, []);
  function selectSection(id: string) { setActive(id); window.history.replaceState(null, "", `#${id}`); }
  return <><PageHeader eyebrow="Settings" title="Settings" icon="settings" description="Local preferences, backup tools, and the visual language of your training workspace." /><div className="grid gap-8 md:grid-cols-[12rem_minmax(0,1fr)] md:items-start"><SectionSidebar items={settingsSections} activeId={active} onSelect={selectSection} ariaLabel="Settings sections" /><div key={active} className="enter min-h-64">
    {active === "program" && <section><h2 className="text-xl font-medium">Program</h2><p className="mt-2 max-w-lg text-sm leading-6 text-muted">Your active training plan and its current block. Workout templates remain versioned so past sessions keep their original structure.</p><div className="mt-8 grid max-w-xl gap-6 py-6 sm:grid-cols-3"><div><p className="text-xs uppercase tracking-[.16em] text-muted">Program</p><p className="mt-2 font-medium">PPL Hypertrophy</p></div><div><p className="text-xs uppercase tracking-[.16em] text-muted">Version</p><p className="mt-2 font-medium">Version 1</p></div><div><p className="text-xs uppercase tracking-[.16em] text-muted">Duration</p><p className="mt-2 font-medium">16 weeks</p></div></div><div className="mt-7"><p className="text-xs uppercase tracking-[.16em] text-muted">Active block</p><p className="mt-2 text-2xl font-medium">Week 01 <span className="text-sm font-normal text-muted">of 16</span></p></div></section>}
    {active === "appearance" && <section><h2 className="text-xl font-medium">Appearance</h2><p className="mt-2 text-sm text-muted">Mode and font for the whole workspace. Fuchsia is the fixed highlight accent.</p><div className="mt-7"><ThemeSettings /></div></section>}
    {active === "backup" && <section><h2 className="text-xl font-medium">Backup & restore</h2><p className="mt-3 max-w-lg text-sm leading-6 text-muted">Export JSON or CSV from the local database. Restore validates existing records safely.</p><div className="mt-8 flex flex-wrap gap-2"><a href="/api/export" className="rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white">Export JSON</a><a href="/api/export?format=csv" className="rounded-xl border border-line px-4 py-2.5 text-sm text-ink">Export CSV</a></div></section>}
  </div></div></>;
}
