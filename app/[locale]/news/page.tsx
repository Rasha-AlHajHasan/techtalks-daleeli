"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, Newspaper, ExternalLink, Calendar, Heart } from "lucide-react";
import { getAllNews, getSyndicatesWithCount } from "@/app/lib/news/queries";
import type { NewsItemWithSyndicate } from "@/app/lib/news/queries";

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

function formatDate(dateStr: string | null, locale: string) {
  if (!dateStr) return "—";
  const localeCode =
    locale === "ar" ? "ar-LB" : locale === "fr" ? "fr-FR" : "en-GB";
  return new Date(dateStr).toLocaleDateString(localeCode, {
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
function NewsCard({
  item,
  locale,
}: {
  item: NewsItemWithSyndicate;
  locale: string;
}) {
  const [saved, setSaved] = useState(false);

  const displayDate = item.published_at ?? item.fetched_at;
  const todayItem = isToday(displayDate);
  const syndicate = item.syndicates ?? null;
  const syndicateSlug = syndicate?.slug ?? null;
  const isRTL = locale === "ar";

  return (
    <article
      dir={isRTL ? "rtl" : "ltr"}
      className={`group relative bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col ${
        todayItem
          ? "border-blue-300 shadow-blue-100/60 shadow-sm"
          : "border-slate-200 hover:border-blue-600/25"
      }`}
    >
      {/* Today Banner */}
      {todayItem && (
        <div className="bg-blue-100 px-4 py-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
            {locale === "ar" ? "اليوم" : locale === "fr" ? "Aujourd'hui" : "Today"}
          </span>
        </div>
      )}

      {/* Top blue accent bar */}
      <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400" />

      {/* Content — no fixed height, grows with data */}
      <div className="p-5 flex flex-col gap-3">

        {/* Badge row */}
        <div className="flex items-center justify-between gap-2">
          {item.language && (
            <span className="inline-flex items-center px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-[10px] font-bold uppercase tracking-wider text-blue-700">
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

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">
          {item.title}
        </h3>

        {/* Summary — only rendered if it exists */}
        {item.summary && (
          <p className="text-xs text-slate-500 leading-relaxed">
            {item.summary}
          </p>
        )}

        {/* Syndicate + date */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          {syndicate && (
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
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
              {formatDate(displayDate, locale)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {syndicateSlug ? (
            <Link
              href={`/${locale}/syndicates/${syndicateSlug}`}
              className="flex-1 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg py-2 transition"
            >
              {locale === "ar" ? "اقرأ المزيد" : locale === "fr" ? "Lire la suite" : "Read More"}
            </Link>
          ) : (
            <span className="flex-1 text-center text-xs font-semibold text-slate-400 bg-slate-100 rounded-lg py-2 cursor-not-allowed">
              {locale === "ar" ? "اقرأ المزيد" : locale === "fr" ? "Lire la suite" : "Read More"}
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
              {locale === "ar" ? "المصدر" : locale === "fr" ? "Source" : "Source"}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const params = useParams();
  const locale = (params.locale as string) ?? "ar";
  const isRTL = locale === "ar";

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
          getAllNews(locale),
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
  }, [locale]);

  const filtered = useMemo(() => {
    let items = newsList;

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
          matchedSlugs.includes(n.syndicates?.slug ?? ""),
      );
    }

    return items;
  }, [search, activeSyndicate, newsList, syndicates]);

  // ── UI strings ───────────────────────────────────────────────────────────
  const t = {
    // portal:
      // locale === "ar" ? "البوابة الرسمية للنقابات"
      // : locale === "fr" ? "Portail Officiel des Syndicats"
      // : "Official Syndicate Portal",
    heading:
      locale === "ar" ? "آخر الأخبار"
      : locale === "fr" ? "Dernières Nouvelles"
      : "Latest News",
    subtitle:
      locale === "ar" ? "اطلع على آخر التحديثات والقرارات والإعلانات من النقابات اللبنانية المهنية."
      : locale === "fr" ? "Découvrez les dernières mises à jour, décisions et annonces des syndicats professionnels libanais."
      : "Check latest updates, decisions, and announcements from Lebanese professional syndicates.",
    searchPlaceholder:
      locale === "ar" ? "ابحث باسم النقابة أو بالكلمة المفتاحية..."
      : locale === "fr" ? "Rechercher par syndicat ou mot-clé..."
      : "Search by syndicate name or keyword...",
    searchBtn: locale === "ar" ? "بحث" : locale === "fr" ? "Chercher" : "Search",
    syndicateLabel: locale === "ar" ? "النقابة" : locale === "fr" ? "Syndicat" : "Syndicate",
    allSyndicates:
      locale === "ar" ? "جميع النقابات"
      : locale === "fr" ? "Tous les syndicats"
      : "All Syndicates",
    latestNews:
      locale === "ar" ? "آخر الأخبار"
      : locale === "fr" ? "Dernières nouvelles"
      : "Latest News",
    featured:
      locale === "ar" ? "مميز" : locale === "fr" ? "À la une" : "Featured",
    exploreLabel:
      locale === "ar" ? "استكشف تحديثات النقابات في لبنان"
      : locale === "fr" ? "Explorez les actualités des syndicats du Liban"
      : "Explore syndicate updates from Lebanon",
    errorMsg:
      locale === "ar" ? "فشل تحميل الأخبار. يرجى تحديث الصفحة."
      : locale === "fr" ? "Échec du chargement. Veuillez actualiser."
      : "Failed to load news. Please try refreshing.",
    noNews:
      locale === "ar" ? "لا توجد أخبار."
      : locale === "fr" ? "Aucune actualité trouvée."
      : "No news found.",
    translating:
      locale === "ar" ? null
      : locale === "fr" ? "Traduction en cours…"
      : "Translating news…",
  };

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Hero ── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-12 text-center">
          <span className="inline-block bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4">
            {t.portal}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-3">
            {t.heading}
          </h1>
          <p className="text-slate-500 text-base mb-8 max-w-md mx-auto">
            {t.subtitle}
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
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-3 rounded-xl transition whitespace-nowrap">
              {t.searchBtn}
            </button>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">

        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-6">
            <h2 className="text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-4">
              {t.syndicateLabel}
            </h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveSyndicate(null)}
                  className={
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition " +
                    (activeSyndicate === null
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-slate-600 hover:bg-slate-50")
                  }
                >
                  <span>{t.allSyndicates}</span>
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
                ? [...Array(4)].map((_, i) => (
                    <li key={i}>
                      <div className="h-9 bg-slate-100 rounded-lg animate-pulse mx-1 my-1" />
                    </li>
                  ))
                : syndicates.map((syn) => (
                    <li key={syn.id}>
                      <button
                        onClick={() => {
                          setActiveSyndicate(syn.slug === activeSyndicate ? null : syn.slug);
                          setSearch("");
                        }}
                        className={
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition " +
                          (activeSyndicate === syn.slug
                            ? "bg-blue-600 text-white font-semibold"
                            : "text-slate-600 hover:bg-slate-50")
                        }
                      >
                        <span className="text-left leading-snug">{syn.name}</span>
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
              <h2 className="text-xl font-extrabold text-slate-800">{t.latestNews}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{t.exploreLabel}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("latest")}
                className={
                  "text-xs font-semibold px-4 py-2 rounded-lg transition " +
                  (activeTab === "latest"
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-600/40")
                }
              >
                {t.latestNews}
              </button>
              <button
                onClick={() => setActiveTab("featured")}
                className={
                  "text-xs font-semibold px-4 py-2 rounded-lg transition " +
                  (activeTab === "featured"
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-600/40")
                }
              >
                {t.featured}
              </button>
            </div>
          </div>

          {/* Translating banner */}
          {loading && locale !== "ar" && t.translating && (
            <div className="flex items-center gap-2 mb-4 text-xs text-blue-600 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse flex-shrink-0" />
              {t.translating}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-20 text-slate-400">
              <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-red-500">{t.errorMsg}</p>
            </div>
          )}

          {/* Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">{t.noNews}</p>
            </div>
          )}

          {/* Grid — items-start so cards don't stretch to match tallest sibling */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
              {filtered.map((item) => (
                <NewsCard key={item.id} item={item} locale={locale} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}