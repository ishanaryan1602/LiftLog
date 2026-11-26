import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return <nav aria-label="Breadcrumb" >
    <ol >
      {items.map((item, index) => <li key={`${item.label}-${index}`} >
        {index > 0 && <ChevronRight aria-hidden="true"  />}
        {item.href ? <Link href={item.href as Route} >{item.label}</Link> : <span aria-current="page" >{item.label}</span>}
      </li>)}
    </ol>
  </nav>;
}
