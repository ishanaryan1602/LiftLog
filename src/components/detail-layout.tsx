import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";

export function DetailLayout({ backHref, backLabel, breadcrumbSection, breadcrumbSectionHref, currentLabel, breadcrumbTail, summary, sidebar, title, subtitle, actions, children, scrollable = false, showHeader = true }: { backHref: string; backLabel: string; breadcrumbSection?: string; breadcrumbSectionHref?: string; currentLabel?: string; breadcrumbTail?: React.ReactNode; summary?: React.ReactNode; sidebar?: React.ReactNode; title?: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; scrollable?: boolean; showHeader?: boolean }) {
  const breadcrumbItems: BreadcrumbItem[] = [{ label: backLabel, href: backHref }];
  if (breadcrumbSection) breadcrumbItems.push({ label: breadcrumbSection, href: breadcrumbSectionHref });
  if (currentLabel) breadcrumbItems.push({ label: currentLabel });
  if (breadcrumbTail) breadcrumbItems.push({ label: String(breadcrumbTail) });

  return <div >
    <Breadcrumbs items={breadcrumbItems} />
    <div >
      <aside >{summary}{sidebar}</aside>
      <main >{showHeader && <div ><div><h2 >{title}</h2>{subtitle && <p >{subtitle}</p>}</div>{actions}</div>}{children}</main>
    </div>
  </div>;
}
