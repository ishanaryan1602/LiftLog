import { DashboardStats } from "./dashboard-stats";
import { DashboardFocus } from "./dashboard-focus";
import { DashboardProgramChart } from "./dashboard-program-chart";
import { DashboardNextSession } from "./dashboard-next-session";

export default function Dashboard() {
  return <>
    <section className="relative mb-7 overflow-hidden rounded-[2rem] bg-transparent px-0 py-4 md:py-6"><div className="relative grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end"><DashboardNextSession /><DashboardProgramChart /></div></section>
    <section className="mb-7 grid gap-4 sm:grid-cols-3"><DashboardStats /><div className="rounded-2xl border border-line/70 bg-panel/45 p-5"><div className="flex items-center gap-2 text-sm text-muted"><span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-caution/15 text-caution"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 17V7l6-3 6 3v10M9 17v-5h6v5"/></svg></span>Current program</div><p className="mt-4 text-xl font-medium tracking-tight">PPL Hypertrophy</p><p className="mt-2 text-sm text-muted">Version 1 · target effort 1 RIR</p></div></section>
    <section className="grid gap-7 lg:grid-cols-2"><DashboardFocus /></section>
  </>;
}
