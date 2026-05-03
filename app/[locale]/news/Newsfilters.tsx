"use client";

import { Search, X } from "lucide-react";
import type { Syndicate, ContentType } from "@/lib/news/types";

const CONTENT_TYPES: { value: ContentType | ""; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "news", label: "News" },
  { value: "announcements", label: "Announcements" },
  { value: "decisions", label: "Decisions" },
  { value: "activities", label: "Activities" },
  { value: "circulars", label: "Circulars" },
  { value: "events", label: "Events" },
  { value: "membership_updates", label: "Membership Updates" },
];

export interface NewsFiltersState {
  search: string;
  syndicateId: string;
  contentType: string;
  sort: "latest" | "oldest";
}

interface NewsFiltersProps {
  filters: NewsFiltersState;
  onChange: (filters: NewsFiltersState) => void;
  syndicates: Syndicate[];
  totalResults: number;
}

export default function NewsFilters({
  filters,
  onChange,
  syndicates,
  totalResults,
}: NewsFiltersProps) {
  const set = (patch: Partial<NewsFiltersState>) =>
    onChange({ ...filters, ...patch });

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.syndicateId !== "" ||
    filters.contentType !== "" ||
    filters.sort !== "latest";

  const clearAll = () =>
    onChange({ search: "", syndicateId: "", contentType: "", sort: "latest" });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-extrabold text-[1d4ed8] uppercase tracking-widest">
          Filter & Search
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-500 transition font-semibold"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">

        {/* ── Search by syndicate name or keyword ── */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={14}
          />
          <input
            value={filters.search}
            onChange={(e) => set({ search: e.target.value, syndicateId: "" })}
            placeholder="Search by syndicate name or keyword..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[1d4ed8]/20 focus:border-[1d4ed8] focus:bg-white transition"
          />
          {filters.search && (
            <button
              onClick={() => set({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* ── Syndicate pills / select ── */}
        <select
          value={filters.syndicateId}
          onChange={(e) => set({ syndicateId: e.target.value, search: "" })}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:ring-2 focus:ring-[1d4ed8]/20 focus:border-[1d4ed8] focus:bg-white transition min-w-[180px]"
        >
          <option value="">All Syndicates</option>
          {syndicates.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* ── Content type ── */}
        <select
          value={filters.contentType}
          onChange={(e) => set({ contentType: e.target.value })}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:ring-2 focus:ring-[1d4ed8]/20 focus:border-[1d4ed8] focus:bg-white transition min-w-[160px]"
        >
          {CONTENT_TYPES.map((ct) => (
            <option key={ct.value} value={ct.value}>
              {ct.label}
            </option>
          ))}
        </select>

        {/* ── Sort ── */}
        <select
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value as "latest" | "oldest" })}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:ring-2 focus:ring-[1d4ed8]/20 focus:border-[1d4ed8] focus:bg-white transition min-w-[120px]"
        >
          <option value="latest">Latest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* ── Active filter chips ── */}
      {(filters.syndicateId || filters.contentType || filters.search) && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          {filters.search && (
            <Chip label={`"${filters.search}"`} onRemove={() => set({ search: "" })} />
          )}
          {filters.syndicateId && (
            <Chip
              label={syndicates.find((s) => s.id === filters.syndicateId)?.name ?? filters.syndicateId}
              onRemove={() => set({ syndicateId: "" })}
            />
          )}
          {filters.contentType && (
            <Chip
              label={CONTENT_TYPES.find((c) => c.value === filters.contentType)?.label ?? filters.contentType}
              onRemove={() => set({ contentType: "" })}
            />
          )}
          <span className="ml-auto text-[11px] text-slate-400 self-center">
            {totalResults} result{totalResults !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[1d4ed8]/8 text-[1d4ed8] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[1d4ed8]/20">
      {label}
      <button onClick={onRemove} className="hover:text-rose-500 transition">
        <X size={10} />
      </button>
    </span>
  );
}