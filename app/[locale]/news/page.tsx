"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, Newspaper, ExternalLink, Calendar, Heart } from "lucide-react";
import { getAllNews, getSyndicatesWithCount } from "@/lib/news/queries";
import type { NewsItemWithSyndicate } from "@/lib/news/queries";

// ─── Types ────────────────────────────────────────────────────────────────────
type SyndicateFilter = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const today = new Date().toISOString().split("T")[0];

function isToday(dateStr?: string | null) {
  if (!dateStr) return false;
  return dateStr.split("T")[0] === today;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-1 bg-slate-200" />
      <div className="h-36 bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-slate-100 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
        <div className="h-8 bg-slate-100 rounded mt-4" />
      </div>
    </div>
  );
}

// ─── News Card ────────────────────────────────────────────────────────────────
function NewsCard({ item }: { item: NewsItemWithSyndicate }) {
  const [saved, setSaved] = useState(false);
  const params = useParams();
  const locale = params.locale as string;

  const displayDate = item.published_at ?? item.fetched_at;
  const todayItem = isToday(displayDate);

  // syndicates is an object from Supabase, not an array
  const syndicate = item.syndicates ?? null;
  const syndicateSlug = syndicate?.slug ?? null;

  return (
    <article className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#1a3560]/30 transition-all duration-300 flex flex-col">
      {/* Today Banner */}
      {todayItem && (
        <div className="bg-yellow-400 px-4 py-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-700 animate-pulse" />
          <span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">
            Today
          </span>
        </div>
      )}

      {/* Top navy accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#1a3560] to-[#2d5aa0]" />

      {/* Image or placeholder */}
      <div className="h-36 bg-gradient-to-br from-[#0d2240]/5 to-[#1a3560]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Newspaper size={32} className="text-[#1a3560]/20" />
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3 gap-2">
          {item.language && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200">
              {item.language}
            </span>
          )}
          <button
            onClick={() => setSaved(!saved)}
            className="ml-auto text-slate-300 hover:text-rose-400 transition-colors"
          >
            <Heart
              size={14}
              fill={saved ? "currentColor" : "none"}
              className={saved ? "text-rose-400" : ""}
            />
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
          {syndicate && (
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-[#1a3560] flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] text-white font-bold">
                  {syndicate.name.charAt(0)}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium truncate">
                {syndicate.name}
              </span>
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
          {syndicateSlug ? (
            <Link
              href={`/${locale}/syndicates/${syndicateSlug}`}
              className="flex-1 text-center text-xs font-semibold text-white bg-[#1a3560] hover:bg-[#0d2240] rounded-lg py-2 transition"
            >
              Read More
            </Link>
          ) : (
            <span className="flex-1 text-center text-xs font-semibold text-slate-400 bg-slate-100 rounded-lg py-2 cursor-not-allowed">
              Read More
            </span>
          )}

          {item.source_url && (
            <a
              href={item.source_url}
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
  const [search, setSearch] = useState("");
  const [activeSyndicate, setActiveSyndicate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"latest" | "featured">("latest");
  const [newsList, setNewsList] = useState<NewsItemWithSyndicate[]>([]);
  const [syndicates, setSyndicates] = useState<SyndicateFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(false);
        const [news, syns] = await Promise.all([
          getAllNews(),
          getSyndicatesWithCount(),
        ]);
        setNewsList(news);
        setSyndicates(syns);
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let items = newsList;

    // ✅ syndicates is an object — access .slug directly
    if (activeSyndicate) {
      items = items.filter((n) => n.syndicates?.slug === activeSyndicate);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchedSlugs = syndicates
        .filter((s) => s.name.toLowerCase().includes(q))
        .map((s) => s.slug);
      items = items.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.summary?.toLowerCase().includes(q) ||
          matchedSlugs.includes(n.syndicates?.slug ?? "")
      );
    }

    return items;
  }, [search, activeSyndicate, newsList, syndicates]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0d1f3c 0%, #1a3560 60%, #1e4080 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-16 text-center">
          <span className="inline-block bg-yellow-400 text-yellow-900 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-5">
            Official Syndicate Portal
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3">
            Latest News
          </h1>
          <p className="text-[#a8c0e0] text-base mb-8 max-w-md mx-auto">
            Check latest updates, decisions, and announcements from Lebanese
            professional syndicates.
          </p>

          <div className="max-w-xl mx-auto flex gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
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
                  className={
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition " +
                    (activeSyndicate === null
                      ? "bg-[#1a3560] text-white font-semibold"
                      : "text-slate-600 hover:bg-slate-50")
                  }
                >
                  <span>All Syndicates</span>
                  <span
                    className={
                      "text-[11px] px-2 py-0.5 rounded-full font-semibold " +
                      (activeSyndicate === null
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500")
                    }
                  >
                    {newsList.length}
                  </span>
                </button>
              </li>
              {loading
                ? [...Array(3)].map((_, i) => (
                    <li key={i}>
                      <div className="h-9 bg-slate-100 rounded-lg animate-pulse mx-1 my-1" />
                    </li>
                  ))
                : syndicates.map((syn) => (
                    <li key={syn.id}>
                      <button
                        onClick={() => {
                          setActiveSyndicate(
                            syn.slug === activeSyndicate ? null : syn.slug
                          );
                          setSearch("");
                        }}
                        className={
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition " +
                          (activeSyndicate === syn.slug
                            ? "bg-[#1a3560] text-white font-semibold"
                            : "text-slate-600 hover:bg-slate-50")
                        }
                      >
                        <span className="text-left leading-snug">
                          {syn.name}
                        </span>
                        <span
                          className={
                            "text-[11px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ml-2 " +
                            (activeSyndicate === syn.slug
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-500")
                          }
                        >
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
              <h2 className="text-xl font-extrabold text-[#0d2240]">
                Latest News
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Explore syndicate updates from Lebanon
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("latest")}
                className={
                  "text-xs font-semibold px-4 py-2 rounded-lg transition " +
                  (activeTab === "latest"
                    ? "bg-[#1a3560] text-white shadow"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-[#1a3560]/40")
                }
              >
                Latest News
              </button>
              <button
                onClick={() => setActiveTab("featured")}
                className={
                  "text-xs font-semibold px-4 py-2 rounded-lg transition " +
                  (activeTab === "featured"
                    ? "bg-[#1a3560] text-white shadow"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-[#1a3560]/40")
                }
              >
                Featured
              </button>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="text-center py-20 text-slate-400">
              <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-red-500">
                Failed to load news. Please try refreshing.
              </p>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No news found.</p>
            </div>
          )}

          {/* News grid */}
          {!loading && !error && filtered.length > 0 && (
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