"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Footprints, LayoutDashboard, Settings2 } from "lucide-react";

type NavIcon = "home" | "training" | "settings";
const items: readonly [string, string, NavIcon][] = [["Home", "/", "home"], ["Training", "/training", "training"], ["Settings", "/settings", "settings"]];
function Icon({ name }: { name: NavIcon }) { const icons = { home: LayoutDashboard, training: Footprints, settings: Settings2 }; const Component = icons[name]; return <Component  strokeWidth={1.7} aria-hidden="true" />; }
export function TopNav() { const pathname = usePathname(); const active = (href: string) => href === "/" ? pathname === "/" : href === "/training" ? pathname.startsWith("/training") || pathname.startsWith("/workouts") : pathname.startsWith(href); return <nav aria-label="Main navigation">{items.map(([label, href, icon]) => <div key={href}><Link href={href as Route} aria-current={active(href) ? "page" : undefined}><span><Icon name={icon}/>{label}</span></Link></div>)}</nav>; }
