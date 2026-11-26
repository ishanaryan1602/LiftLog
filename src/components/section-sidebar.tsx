"use client";

export type SectionSidebarItem = readonly [id: string, label: string, disabled?: boolean];

export function SectionSidebar({ items, activeId, onSelect, ariaLabel, title }: { items: readonly SectionSidebarItem[]; activeId: string; onSelect: (id: string) => void; ariaLabel: string; title?: string }) {
  const activeIndex = Math.max(0, items.findIndex(([id, , disabled]) => id === activeId && !disabled));
  return <aside className="self-start md:sticky md:top-8">{title && <p className="px-3 text-xs uppercase tracking-[.16em] text-muted">{title}</p>}<nav className={`relative flex gap-2 overflow-x-auto md:flex-col ${title ? "mt-3" : ""}`} aria-label={ariaLabel}><span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 hidden h-6 w-0.5 bg-purple transition-transform duration-300 ease-out md:block" style={{ transform: `translateY(${activeIndex * 48 + 7}px)` }} />{items.map(([id, label, disabled]) => <button key={id} type="button" disabled={disabled} aria-disabled={disabled || undefined} onClick={() => onSelect(id)} className={`whitespace-nowrap px-3 py-2.5 text-left text-sm transition ${disabled ? "cursor-not-allowed text-muted/50" : `hover:text-ink ${activeId === id ? "text-ink" : "text-muted"}`}`}>{label}</button>)}</nav></aside>;
}
