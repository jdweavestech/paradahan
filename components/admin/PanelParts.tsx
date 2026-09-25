"use client";

import { Loader2, type LucideIcon } from "lucide-react";

export function FilterTabs<T extends string>({
  filters,
  active,
  onChange,
  counts,
}: {
  filters: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  /** Per-status counts for the currently loaded list; omitted while loading. */
  counts?: Record<string, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            active === f.id ? "bg-primary text-white shadow-soft" : "border border-border text-ink/70 hover:bg-ink/5"
          }`}
        >
          {f.label}
          {f.id !== "all" && counts && (
            <span className={`rounded-full px-1.5 py-0.5 text-xs ${active === f.id ? "bg-white/20" : "bg-ink/5"}`}>
              {counts[f.id] ?? 0}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function PanelState({
  loading,
  error,
  empty,
  icon: Icon,
  emptyText,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  icon: LucideIcon;
  emptyText: string;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }
  if (error) {
    return <p className="rounded-2xl bg-danger/10 p-4 text-sm font-medium text-danger">{error}</p>;
  }
  if (empty) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-14 text-center">
        <Icon size={28} className="mx-auto text-muted" />
        <p className="mt-3 text-sm font-semibold text-ink">Nothing here</p>
        <p className="mt-1 text-sm text-muted">{emptyText}</p>
      </div>
    );
  }
  return null;
}
