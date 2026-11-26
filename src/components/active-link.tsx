"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

type NavIcon = "dashboard" | "log" | "settings";

function Icon({ name }: { name: NavIcon }) {
  const paths = {
    dashboard: <><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>,
    log: <><rect x="6" y="4" width="12" height="16" rx="2"/><path d="m9 9 1.5 1.5L13 8M9 14h6"/></>,
    settings: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="11" cy="18" r="2"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" >{paths[name]}</svg>;
}

export function ActiveLink({ href, label, exact = false, icon }: { href: string; label: string; exact?: boolean; icon?: NavIcon }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return <Link href={href as Route} aria-label={label} aria-current={active ? "page" : undefined}><span>{icon && <Icon name={icon}/>}<span>{label}</span></span></Link>;
}
