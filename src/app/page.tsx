import { DashboardStats } from "./dashboard-stats";
import { DashboardFocus } from "./dashboard-focus";
import { DashboardProgramChart } from "./dashboard-program-chart";
import { DashboardNextSession } from "./dashboard-next-session";

export default function Dashboard() {
  return <>
    <section ><div ><DashboardNextSession /><DashboardProgramChart /></div></section>
    <section ><DashboardStats /><div ><div ><span ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" ><path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 17V7l6-3 6 3v10M9 17v-5h6v5"/></svg></span>Current program</div><p >PPL Hypertrophy</p><p >Version 1 · target effort 1 RIR</p></div></section>
    <section ><DashboardFocus /></section>
  </>;
}
