"use client";
import Link from "next/link";
import { LayoutGroup, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Route } from "next";
import { Footprints, LayoutDashboard, Settings2 } from "lucide-react";

type NavIcon = "home" | "training" | "settings";
const items: readonly [string, string, NavIcon][] = [["Home", "/", "home"], ["Training", "/training", "training"], ["Settings", "/settings", "settings"]];
function Icon({ name }: { name: NavIcon }) { const icons = { home: LayoutDashboard, training: Footprints, settings: Settings2 }; const Component = icons[name]; return <Component className="topbar-icon" strokeWidth={1.7} aria-hidden="true" />; }
export function TopNav() { const pathname = usePathname(); const [hovered, setHovered] = useState<string | null>(null); const active = (href: string) => href === "/" ? pathname === "/" : href === "/training" ? pathname.startsWith("/training") || pathname.startsWith("/workouts") : pathname.startsWith(href); return <LayoutGroup id="topbar-navigation"><nav className="topbar-nav" aria-label="Main navigation">{items.map(([label, href, icon]) => { const isActive = active(href); const showPill = hovered ? hovered === href : isActive; return <motion.div key={href} className="topbar-item" onMouseEnter={() => setHovered(href)} onMouseLeave={() => setHovered(null)} whileHover={{ y: -1 }} transition={{ duration: .22, ease: [.22, 1, .36, 1] }}><Link href={href as Route} aria-current={isActive ? "page" : undefined} className={`topbar-link ${isActive ? "is-active" : ""}`}>{showPill && <motion.span layoutId="topbar-active" className="topbar-pill" transition={{ type: "spring", stiffness: 360, damping: 32 }} />}<span className="topbar-label"><Icon name={icon}/>{label}</span></Link></motion.div>; })}</nav></LayoutGroup>; }
