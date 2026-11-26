"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { Route } from "next";
import { cn } from "@/lib/utils";

type NavIcon = "dashboard" | "log" | "settings";
const MotionLink = motion(Link);

function Icon({ name }: { name: NavIcon }) {
  const paths = {
    dashboard: <><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>,
    log: <><rect x="6" y="4" width="12" height="16" rx="2"/><path d="m9 9 1.5 1.5L13 8M9 14h6"/></>,
    settings: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="11" cy="18" r="2"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">{paths[name]}</svg>;
}

export function ActiveLink({ href, label, exact = false, className, icon, labelClassName, expandOnHover = false, expanded = false, onHoverChange, expandedWidth = 32 }: { href: string; label: string; exact?: boolean; className?: string; icon?: NavIcon; labelClassName?: string; expandOnHover?: boolean; expanded?: boolean; onHoverChange?: (hovered: boolean) => void; expandedWidth?: number }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  const linkClass = cn("group flex whitespace-nowrap text-muted transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-purple/70 focus-visible:ring-offset-2 focus-visible:ring-offset-paper", className, active && "text-ink");
  if (!expandOnHover) return <Link href={href as Route} aria-label={label} aria-current={active ? "page" : undefined} className={linkClass}><span className="relative inline-flex items-center gap-2">{icon && <Icon name={icon}/>}<span className={labelClassName}>{label}</span></span></Link>;
  return <MotionLink data-nav-href={href} href={href as Route} aria-label={label} aria-current={active ? "page" : undefined} animate={{ width: expanded ? expandedWidth : 32 }} onMouseEnter={() => onHoverChange?.(true)} onFocus={() => onHoverChange?.(true)} transition={{ duration: .55, ease: [.22, 1, .36, 1] }} className={linkClass}>
    <span className="top-nav-link-content"><span className="top-nav-icon">{icon && <Icon name={icon}/>}</span><motion.span className={labelClassName} animate={{ width: expanded ? expandedWidth - 45 : 0, opacity: expanded ? 1 : 0 }} transition={{ duration: .75, ease: [.22, 1, .36, 1] }}>{label}</motion.span></span>
  </MotionLink>;
}
