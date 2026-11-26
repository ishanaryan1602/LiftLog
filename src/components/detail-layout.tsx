import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";

export function DetailLayout({ backHref, backLabel, breadcrumbSection, breadcrumbSectionHref, currentLabel, breadcrumbTail, summary, sidebar, title, subtitle, actions, children, scrollable = false, showHeader = true }: { backHref: string; backLabel: string; breadcrumbSection?: string; breadcrumbSectionHref?: string; currentLabel?: string; breadcrumbTail?: React.ReactNode; summary?: React.ReactNode; sidebar?: React.ReactNode; title?: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; scrollable?: boolean; showHeader?: boolean }) {
  const breadcrumbItems: BreadcrumbItem[] = [{ label: backLabel, href: backHref }];
  if (breadcrumbSection) breadcrumbItems.push({ label: breadcrumbSection, href: breadcrumbSectionHref });
  if (currentLabel) breadcrumbItems.push({ label: currentLabel });
  if (breadcrumbTail) breadcrumbItems.push({ label: String(breadcrumbTail) });

  return <div className="workout-detail mx-auto w-full">
    <Breadcrumbs items={breadcrumbItems} />
    <div className="detail-layout-shell grid items-start gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="space-y-10 lg:sticky lg:top-6">{summary}{sidebar}</aside>
      <main className={scrollable ? "detail-layout-main workout-scroll-pane relative min-w-0 flex flex-col overflow-hidden" : "detail-layout-main relative min-w-0"}>{showHeader && <div className="mb-4 flex shrink-0 items-center justify-between gap-4 border-b border-line pb-2"><div><h2 className="text-sm font-semibold">{title}</h2>{subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}</div>{actions}</div>}{children}</main>
    </div>
  </div>;
}
