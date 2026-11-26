"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui";
import { SectionSidebar } from "@/components/section-sidebar";

const settingsSections = [["program", "Program"], ["backup", "Backup & restore"]] as const;

export default function Settings() {
  const [active, setActive] = useState("program");
  useEffect(() => { const hash = window.location.hash.slice(1); if (settingsSections.some(([id]) => id === hash)) setActive(hash); }, []);
  function selectSection(id: string) { setActive(id); window.history.replaceState(null, "", `#${id}`); }
  return <><PageHeader eyebrow="Settings" title="Settings" icon="settings" description="Program information and local backup tools." /><div ><SectionSidebar items={settingsSections} activeId={active} onSelect={selectSection} ariaLabel="Settings sections" /><div key={active} >
    {active === "program" && <section><h2 >Program</h2><p >Your active training plan and its current block. Workout templates remain versioned so past sessions keep their original structure.</p><div ><div><p >Program</p><p >PPL Hypertrophy</p></div><div><p >Version</p><p >Version 1</p></div><div><p >Duration</p><p >16 weeks</p></div></div><div ><p >Active block</p><p >Week 01 <span >of 16</span></p></div></section>}
    {active === "backup" && <section><h2 >Backup & restore</h2><p >Export JSON or CSV from the local database. Restore validates existing records safely.</p><div ><a href="/api/export" >Export JSON</a><a href="/api/export?format=csv" >Export CSV</a></div></section>}
  </div></div></>;
}
