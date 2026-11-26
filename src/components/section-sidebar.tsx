"use client";

export type SectionSidebarItem = readonly [id: string, label: string, disabled?: boolean];

export function SectionSidebar({ items, activeId, onSelect, ariaLabel, title }: { items: readonly SectionSidebarItem[]; activeId: string; onSelect: (id: string) => void; ariaLabel: string; title?: string }) {
  const activeIndex = Math.max(0, items.findIndex(([id, , disabled]) => id === activeId && !disabled));
  return <aside >{title && <p >{title}</p>}<nav  aria-label={ariaLabel}><span aria-hidden="true"   />{items.map(([id, label, disabled]) => <button key={id} type="button" disabled={disabled} aria-disabled={disabled || undefined} onClick={() => onSelect(id)} >{label}</button>)}</nav></aside>;
}
