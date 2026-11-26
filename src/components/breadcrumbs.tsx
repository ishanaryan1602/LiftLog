import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return <nav aria-label="Breadcrumb" className="workout-detail-breadcrumb mb-7">
    <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted sm:gap-2">
      {items.map((item, index) => <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5 sm:gap-2">
        {index > 0 && <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-muted/50" />}
        {item.href ? <Link href={item.href as Route} className="transition hover:text-ink">{item.label}</Link> : <span aria-current="page" className="text-ink">{item.label}</span>}
      </li>)}
    </ol>
  </nav>;
}
