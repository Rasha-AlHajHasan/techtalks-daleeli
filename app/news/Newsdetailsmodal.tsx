"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, ExternalLink, Calendar, Building2 } from "lucide-react";
import type { NewsItem, ContentType } from "@/app/lib/news/types";

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  news: "News",
  announcements: "Announcement",
  decisions: "Decision",
  activities: "Activity",
  circulars: "Circular",
  events: "Event",
  membership_updates: "Membership Update",
};

const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
  news: "bg-blue-50 text-blue-700 border-blue-200",
  announcements: "bg-amber-50 text-amber-700 border-amber-200",
  decisions: "bg-purple-50 text-purple-700 border-purple-200",
  activities: "bg-green-50 text-green-700 border-green-200",
  circulars: "bg-orange-50 text-orange-700 border-orange-200",
  events: "bg-teal-50 text-teal-700 border-teal-200",
  membership_updates: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface NewsDetailsModalProps {
  item: NewsItem | null;
  onClose: () => void;
}

export default function NewsDetailsModal({
  item,
  onClose,
}: NewsDetailsModalProps) {
  useEffect(() => {
    if (!item) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item) return null;

  const displayDate = item.published_at ?? item.fetched_at;
  const typeColor =
    CONTENT_TYPE_COLORS[item.content_type] ?? CONTENT_TYPE_COLORS.news;
  const typeLabel =
    CONTENT_TYPE_LABELS[item.content_type] ?? item.content_type;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Image */}
        {item.image_url && (
          <div className="relative h-52 rounded-t-2xl overflow-hidden">
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}

        {/* Header */}
        <div className="p-6 pb-0 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide border ${typeColor}`}
              >
                {typeLabel}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={12} />
                {displayDate && formatDate(displayDate)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              {item.title}
            </h2>
            {item.syndicate && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-5 h-5 rounded-full bg-[#1a2b48] flex items-center justify-center">
                  <span className="text-[9px] text-white font-bold">
                    {item.syndicate.name.charAt(0)}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {item.syndicate.name}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {item.summary && (
            <p className="text-sm text-slate-600 leading-relaxed mb-4 font-medium">
              {item.summary}
            </p>
          )}
          {item.content && item.content !== "Full content here..." && (
            <div className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none">
              {item.content}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1a2b48] hover:bg-[#142238] rounded-lg transition"
            >
              <ExternalLink size={14} />
              View Original Source
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}