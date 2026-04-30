"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Newspaper, ExternalLink, Calendar, Heart } from "lucide-react";
import type { NewsItem, ContentType } from "@/app/lib/news/types";
import { useParams } from "next/navigation"
// ─── Helpers ─────────────────────────────────────────────────────────────────
const today = new Date().toISOString().split("T")[0];

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
  news: "bg-blue-50 text-blue-700 border-blue-200",
  announcements: "bg-amber-50 text-amber-700 border-amber-200",
  decisions: "bg-[#0d2240] text-white border-[#0d2240]",
  activities: "bg-green-50 text-green-700 border-green-200",
  circulars: "bg-orange-50 text-orange-700 border-orange-200",
  events: "bg-teal-50 text-teal-700 border-teal-200",
  membership_updates: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

function isToday(dateStr?: string) {
  if (!dateStr) return false;
  return dateStr.split("T")[0] === today;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type ApiNewsItem = NewsItem & {
  syndicate_id: string;
  syndicates?: NewsItem["syndicate"];
};

// ─── News Card ────────────────────────────────────────────────────────────────
function NewsCard({ item }: { item: NewsItem }) {
  const [saved, setSaved] = useState(false);
  const displayDate = item.published_at ?? item.fetched_at;
  const todayItem = isToday(displayDate);
  const typeColor = CONTENT_TYPE_COLORS[item.content_type] ?? CONTENT_TYPE_COLORS.news;
  const typeLabel = CONTENT_TYPE_LABELS[item.content_type] ?? item.content_type;

  return (
    <article className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#1a3560]/30 transition-all duration-300 flex flex-col">
      {/* Today Banner */}
      {todayItem && (
        <div className="bg-yellow-400 px-4 py-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-700 animate-pulse" />
          <span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">Today</span>
        </div>
      )}

      {/* Top navy accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#1a3560] to-[#2d5aa0]" />

      {/* Placeholder image area */}
      <div className="h-36 bg-gradient-to-br from-[#0d2240]/5 to-[#1a3560]/10 flex items-center justify-center flex-shrink-0">
        <Newspaper size={32} className="text-[#1a3560]/20" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3 gap-2">
          <span className={"inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border " + typeColor}>
            {typeLabel}
          </span>
          <button onClick={() => setSaved(!saved)} className="text-slate-300 hover:text-rose-400 transition-colors">
            <Heart size={14} fill={saved ? "currentColor" : "none"} className={saved ? "text-rose-400" : ""} />
          </button>
        </div>

        <h3 className="text-sm font-bold text-[#0d2240] leading-snug mb-2 line-clamp-2 group-hover:text-[#2d5aa0] transition-colors">
          {item.title}
        </h3>

        {item.summary && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-3 flex-1">
            {item.summary}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mb-4">
          {item.syndicate && (
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-[#1a3560] flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] text-white font-bold">{item.syndicate.name.charAt(0)}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium truncate">{item.syndicate.name}</span>
            </div>
          )}
          {displayDate && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0">
              <Calendar size={10} />
              {formatDate(displayDate)}
            </span>
          )}
        </div>

        <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
          <button className="flex-1 text-center text-xs font-semibold text-white bg-[#1a3560] hover:bg-[#0d2240] rounded-lg py-2 transition">
            Read More
          </button>
          {item.source_url && (
            
             <a href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
            >
              <ExternalLink size={11} />
              Source
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const params = useParams()
  const locale = (params?.locale as string) === "api" ? "en" : (params?.locale as string) ?? "en";
  const [search, setSearch] = useState("");
  const [activeSyndicate, setActiveSyndicate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"latest" | "featured">("latest");
  const [newsList, setNewsList] = useState<(NewsItem & { syndicate_id: string })[]>([]);
  const [syndicates, setSyndicates] = useState<{ id: string; name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/news`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          const message = payload?.error ?? `HTTP error: ${res.status}`;
          throw new Error(message);
        }

        return res.json();
      })
      .then((payload) => {
        const rawItems = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        const data = rawItems.map((item: ApiNewsItem) => ({
          ...item,
          syndicate: item.syndicate ?? item.syndicates,
          content_type: item.content_type ?? "news",
        })) as (NewsItem & { syndicate_id: string })[];

        setError(null);
        setNewsList(data);

        // Build syndicates list dynamically from the news data
        const syndicateMap = new Map<string, { id: string; name: string; count: number }>();
        data.forEach((item) => {
          if (item.syndicate_id && item.syndicate) {
            const existing = syndicateMap.get(item.syndicate_id);
            if (existing) {
              existing.count++;
            } else {
              syndicateMap.set(item.syndicate_id, {
                id: item.syndicate_id,
                name: item.syndicate.name,
                count: 1,
              });
            }
          }
        });
        setSyndicates(Array.from(syndicateMap.values()));
      })
      .catch((err) => {
        console.error("Failed to fetch news:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch news");
        setNewsList([]);
        setSyndicates([]);
      })
      .finally(() => setLoading(false));
  }, [locale]);

  const filtered = useMemo(() => {
    let items = newsList;
    if (activeSyndicate) {
      items = items.filter((n) => n.syndicate_id === activeSyndicate);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchedSyndicateIds = syndicates
        .filter((s) => s.name.toLowerCase().includes(q))
        .map((s) => s.id);
      items = items.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.summary?.toLowerCase().includes(q) ||
          matchedSyndicateIds.includes(n.syndicate_id)
      );
    }
    return items;
  }, [search, activeSyndicate, newsList, syndicates]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d1f3c 0%, #1a3560 60%, #1e4080 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-16 text-center">
          <span className="inline-block bg-yellow-400 text-yellow-900 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-5">
            Official Syndicate Portal
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3">
            New News!!
          </h1>
          <p className="text-[#a8c0e0] text-base mb-8 max-w-md mx-auto">
            Check latest updates, decisions, and announcements from Lebanese professional syndicates.
          </p>

          <div className="max-w-xl mx-auto flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveSyndicate(null);
                }}
                placeholder="Search by syndicate name or keyword..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-sm text-slate-800 shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <button className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold text-sm px-5 py-3 rounded-xl transition shadow-md whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">

        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-6">
            <h2 className="text-xs font-extrabold text-[#0d2240] uppercase tracking-widest mb-4">
              Syndicate
            </h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveSyndicate(null)}
                  className={"w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition " +
                    (activeSyndicate === null
                      ? "bg-[#1a3560] text-white font-semibold"
                      : "text-slate-600 hover:bg-slate-50")}
                >
                  <span>All Syndicates</span>
                  <span className={"text-[11px] px-2 py-0.5 rounded-full font-semibold " +
                    (activeSyndicate === null ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>
                    {newsList.length}
                  </span>
                </button>
              </li>
              {syndicates.map((syn) => (
                <li key={syn.id}>
                  <button
                    onClick={() => {
                      setActiveSyndicate(syn.id === activeSyndicate ? null : syn.id);
                      setSearch("");
                    }}
                    className={"w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition " +
                      (activeSyndicate === syn.id
                        ? "bg-[#1a3560] text-white font-semibold"
                        : "text-slate-600 hover:bg-slate-50")}
                  >
                    <span className="text-left leading-snug">{syn.name}</span>
                    <span className={"text-[11px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ml-2 " +
                      (activeSyndicate === syn.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>
                      {syn.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-[#0d2240]">Latest News</h2>
              <p className="text-xs text-slate-400 mt-0.5">Explore suggested syndicate updates</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("latest")}
                className={"text-xs font-semibold px-4 py-2 rounded-lg transition " +
                  (activeTab === "latest"
                    ? "bg-[#1a3560] text-white shadow"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-[#1a3560]/40")}
              >
                Latest News
              </button>
              <button
                onClick={() => setActiveTab("featured")}
                className={"text-xs font-semibold px-4 py-2 rounded-lg transition " +
                  (activeTab === "featured"
                    ? "bg-[#1a3560] text-white shadow"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-[#1a3560]/40")}
              >
                Featured
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400">
              <Newspaper size={40} className="mx-auto mb-3 opacity-30 animate-pulse" />
              <p className="text-sm font-medium">Loading news...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-slate-400">
              <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-red-500">Unable to load news.</p>
              <p className="text-xs mt-2 text-slate-500">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No news found for your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
