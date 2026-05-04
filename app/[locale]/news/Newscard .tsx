"use client";

import { useState } from "react";
import { ExternalLink, Heart, MapPin, Clock, Tag } from "lucide-react";
import type { NewsItem, ContentType } from "@/app/lib/news/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  news: "News",
  announcements: "Announcement",
  decisions: "Decision",
  activities: "Activity",
  circulars: "Circular",
  events: "Event",
  membership_updates: "Membership",
};

const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
  news: "text-blue-600 bg-blue-50 border-blue-200",
  announcements: "text-amber-600 bg-amber-50 border-amber-200",
  decisions: "text-[1d4ed8] bg-[1d4ed8]/8 border-[1d4ed8]/20",
  activities: "text-green-600 bg-green-50 border-green-200",
  circulars: "text-orange-600 bg-orange-50 border-orange-200",
  events: "text-teal-600 bg-teal-50 border-teal-200",
  membership_updates: "text-indigo-600 bg-indigo-50 border-indigo-200",
};

const TODAY = new Date().toISOString().split("T")[0];

function isToday(dateStr?: string) {
  if (!dateStr) return false;
  return dateStr.split("T")[0] === TODAY;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? "s" : ""} ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NewsCardProps {
  item: NewsItem;
  onReadMore?: (item: NewsItem) => void;
}

export default function NewsCard({ item, onReadMore }: NewsCardProps) {
  const [saved, setSaved] = useState(false);
  const displayDate = item.published_at ?? item.fetched_at ?? "";
  const todayItem = isToday(displayDate);
  const typeColor =
    CONTENT_TYPE_COLORS[item.content_type] ?? CONTENT_TYPE_COLORS.news;
  const typeLabel = CONTENT_TYPE_LABELS[item.content_type] ?? item.content_type;

  return (
    <article
      className={`
        group relative bg-white border rounded-2xl overflow-hidden
        hover:shadow-lg transition-all duration-200 flex flex-col
        ${
          todayItem
            ? "border-blue-200 shadow-blue-100/60 shadow-sm"
            : "border-slate-200 hover:border-[1d4ed8]/25"
        }
      `}
    >
      {/* ── Today banner ── */}
      {todayItem && (
        <div className="bg-blue-100 px-4 py-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-100 animate-pulse" />
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">
            Today
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* ── Row 1: meta tags + save ── */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Content type badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide ${typeColor}`}
            >
              <Tag size={9} />
              {typeLabel}
            </span>

            {/* Syndicate sector badge */}
            {item.syndicate && (
              <span className="inline-flex items-center px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                {item.syndicate.name.split(" ").slice(-1)[0]}
              </span>
            )}

            {/* Time ago */}
            {displayDate && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock size={9} />
                {timeAgo(displayDate)}
              </span>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={() => setSaved(!saved)}
            aria-label={saved ? "Unsave" : "Save"}
            className={`w-7 h-7 flex items-center justify-center rounded-full border transition flex-shrink-0
              ${
                saved
                  ? "border-rose-200 bg-rose-50 text-rose-400"
                  : "border-slate-200 bg-white text-slate-300 hover:text-rose-400 hover:border-rose-200"
              }`}
          >
            <Heart size={13} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        {/* ── Row 2: Title ── */}
        <div>
          <h3 className="text-[15px] font-bold text-[1d4ed8] leading-snug line-clamp-2 group-hover:text-[1d4ed8] transition-colors">
            {item.title}
          </h3>
        </div>

        {/* ── Row 3: Summary / "salary-like" highlight ── */}
        {item.summary && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {item.summary}
          </p>
        )}

        {/* ── Row 4: Syndicate location + category + action ── */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            {/* Syndicate as "location" */}
            {item.syndicate && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500 min-w-0">
                <MapPin size={11} className="text-slate-400 flex-shrink-0" />
                <span className="truncate font-medium">
                  {item.syndicate.name}
                </span>
              </span>
            )}

            {/* Content type as "category" tag */}
            <span className="flex items-center gap-1 text-[11px] text-[1d4ed8] font-semibold bg-[1d4ed8]/6 px-2 py-0.5 rounded-full">
              {typeLabel}
            </span>
          </div>

          {/* Action */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {item.source_url && (
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-[1d4ed8] hover:border-[1d4ed8]/30 transition"
                title="View Source"
              >
                <ExternalLink size={12} />
              </a>
            )}
            <button
              onClick={() => onReadMore?.(item)}
              className="bg-[1d4ed8] hover:bg-[1d4ed8] text-white text-[11px] font-bold px-4 py-1.5 rounded-lg transition whitespace-nowrap"
            >
              Read More
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
