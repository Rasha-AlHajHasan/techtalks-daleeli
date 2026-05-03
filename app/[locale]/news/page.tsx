"use client";

import { useState, useMemo } from "react";
import { Search, Newspaper } from "lucide-react";
import type { NewsItem } from "@/app/lib/news/types";
import NewsCard from "./Newscard ";
import NewsFilters, { type NewsFiltersState } from "./Newsfilters";
import NewsDetailsModal from "./Newsdetailsmodal";

// ─── Mock data — replace with Supabase fetch later ───────────────────────────
const TODAY = new Date().toISOString().split("T")[0];

const SYNDICATES = [
  { id: "engineers",    name: "Order of Engineers & Architects" },
  { id: "physicians",   name: "Order of Physicians" },
  { id: "bar-beirut",   name: "Beirut Bar Association" },
  { id: "accountants",  name: "Association of Accountants" },
  { id: "bar-tripoli",  name: "Tripoli Bar Association" },
  { id: "pharmacists",  name: "Order of Pharmacists" },
  { id: "dentists",     name: "Order of Dentists" },
];

// News count per syndicate derived from newsList below
const SYNDICATE_COUNTS: Record<string, number> = {
  engineers: 2, physicians: 2, "bar-beirut": 1,
  accountants: 1, "bar-tripoli": 1, pharmacists: 1, dentists: 0,
};

const NEWS_LIST: (NewsItem & { syndicate_id: string })[] = [
  {
    id: "1",
    title: "Engineers Syndicate Issues New Safety Standards for High-Rise Buildings",
    summary: "New mandatory regulations for structural assessments in buildings above 12 floors, effective immediately across Lebanon.",
    content: "Full content from DB will appear here.",
    published_at: TODAY,
    fetched_at: TODAY,
    content_type: "decisions",
    syndicate_id: "engineers",
    syndicate: { id: "engineers", name: "Order of Engineers & Architects" },
    source_url: "https://example.com",
  },
  {
    id: "2",
    title: "Engineers Launch Free Structural Audit Initiative for Public Schools",
    summary: "The order partners with the Ministry of Education to provide free inspections for 300 public schools nationwide.",
    content: "Full content from DB will appear here.",
    published_at: "2026-04-22",
    fetched_at: "2026-04-22",
    content_type: "activities",
    syndicate_id: "engineers",
    syndicate: { id: "engineers", name: "Order of Engineers & Architects" },
    source_url: "https://example.com",
  },
  {
    id: "3",
    title: "Annual Medical Conference Registration Now Open for 2026",
    summary: "The Order of Physicians announces its flagship annual conference, featuring international speakers and CME credits.",
    content: "Full content from DB will appear here.",
    published_at: TODAY,
    fetched_at: TODAY,
    content_type: "events",
    syndicate_id: "physicians",
    syndicate: { id: "physicians", name: "Order of Physicians" },
    source_url: "https://example.com",
  },
  {
    id: "4",
    title: "New Guidelines on Electronic Prescriptions Issued",
    summary: "Physicians must comply with updated e-prescription standards by July 1st to maintain active registration.",
    content: "Full content from DB will appear here.",
    published_at: "2026-04-21",
    fetched_at: "2026-04-21",
    content_type: "circulars",
    syndicate_id: "physicians",
    syndicate: { id: "physicians", name: "Order of Physicians" },
    source_url: "https://example.com",
  },
  {
    id: "5",
    title: "Beirut Bar Association Circular on Court Procedures Update",
    summary: "Important circular regarding updated procedures for filing motions at the Beirut Court of First Instance.",
    content: "Full content from DB will appear here.",
    published_at: "2026-04-20",
    fetched_at: "2026-04-20",
    content_type: "circulars",
    syndicate_id: "bar-beirut",
    syndicate: { id: "bar-beirut", name: "Beirut Bar Association" },
    source_url: "https://example.com",
  },
  {
    id: "6",
    title: "Membership Renewal Deadline Extended to May 31st",
    summary: "The Association of Accountants has extended the membership renewal deadline following numerous requests.",
    content: "Full content from DB will appear here.",
    published_at: "2026-04-18",
    fetched_at: "2026-04-18",
    content_type: "membership_updates",
    syndicate_id: "accountants",
    syndicate: { id: "accountants", name: "Association of Accountants" },
    source_url: "https://example.com",
  },
  {
    id: "7",
    title: "New Pharmaceutical Import Regulations Effective June 2026",
    summary: "Order of Pharmacists releases detailed guidelines on the new import compliance requirements from the Ministry of Health.",
    content: "Full content from DB will appear here.",
    published_at: TODAY,
    fetched_at: TODAY,
    content_type: "announcements",
    syndicate_id: "pharmacists",
    syndicate: { id: "pharmacists", name: "Order of Pharmacists" },
    source_url: "https://example.com",
  },
  {
    id: "8",
    title: "Tripoli Bar Association Elects New Executive Board",
    summary: "Following recent elections, the Tripoli Bar Association has announced its new executive board for the 2026–2028 term.",
    content: "Full content from DB will appear here.",
    published_at: "2026-04-15",
    fetched_at: "2026-04-15",
    content_type: "news",
    syndicate_id: "bar-tripoli",
    syndicate: { id: "bar-tripoli", name: "Tripoli Bar Association" },
    source_url: "https://example.com",
  },
];

// ─── Filtering logic ──────────────────────────────────────────────────────────
function applyFilters(
  items: typeof NEWS_LIST,
  filters: NewsFiltersState,
  activeSyndicate: string | null
) {
  let result = [...items];

  // Sidebar syndicate click takes priority
  if (activeSyndicate) {
    result = result.filter((n) => n.syndicate_id === activeSyndicate);
  }

  // Search: match syndicate name OR title/summary
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    const matchedSyndicateIds = SYNDICATES
      .filter((s) => s.name.toLowerCase().includes(q))
      .map((s) => s.id);
    result = result.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.summary?.toLowerCase().includes(q) ||
        matchedSyndicateIds.includes(n.syndicate_id)
    );
  }

  // Dropdown syndicate filter (from NewsFilters)
  if (filters.syndicateId) {
    result = result.filter((n) => n.syndicate_id === filters.syndicateId);
  }

  // Content type filter
  if (filters.contentType) {
    result = result.filter((n) => n.content_type === filters.contentType);
  }

  // Sort
  result.sort((a, b) => {
    const da = new Date(a.published_at ?? a.fetched_at ?? "").getTime();
    const db = new Date(b.published_at ?? b.fetched_at ?? "").getTime();
    return filters.sort === "latest" ? db - da : da - db;
  });

  return result;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [activeSyndicate, setActiveSyndicate] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [filters, setFilters] = useState<NewsFiltersState>({
    search: "",
    syndicateId: "",
    contentType: "",
    sort: "latest",
  });

  const filtered = useMemo(
    () => applyFilters(NEWS_LIST, filters, activeSyndicate),
    [filters, activeSyndicate]
  );

  const handleSidebarClick = (id: string) => {
    setActiveSyndicate((prev) => (prev === id ? null : id));
    setFilters((f) => ({ ...f, search: "", syndicateId: "" }));
  };

  const handleFiltersChange = (next: NewsFiltersState) => {
    setFilters(next);
    if (next.syndicateId || next.search) setActiveSyndicate(null);
  };

  // ── UI strings per locale ─────────────────────────────────────────────────
  const t = {
    portal:
      locale === "ar" ? "البوابة الرسمية للنقابات" :
      locale === "fr" ? "Portail Officiel des Syndicats" :
      "Official Syndicate Portal",
    heading:
      locale === "ar" ? "آخر الأخبار" :
      locale === "fr" ? "Dernières Nouvelles" :
      "Latest News",
    subtitle:
      locale === "ar" ? "اطلع على آخر التحديثات والقرارات والإعلانات من النقابات اللبنانية المهنية." :
      locale === "fr" ? "Découvrez les dernières mises à jour, décisions et annonces des syndicats professionnels libanais." :
      "Check latest updates, decisions, and announcements from Lebanese professional syndicates.",
    searchPlaceholder:
      locale === "ar" ? "ابحث باسم النقابة أو بالكلمة المفتاحية..." :
      locale === "fr" ? "Rechercher par syndicat ou mot-clé..." :
      "Search by syndicate name or keyword...",
    searchBtn:
      locale === "ar" ? "بحث" : locale === "fr" ? "Chercher" : "Search",
    syndicateLabel:
      locale === "ar" ? "النقابة" : locale === "fr" ? "Syndicat" : "Syndicate",
    allSyndicates:
      locale === "ar" ? "جميع النقابات" : locale === "fr" ? "Tous les syndicats" : "All Syndicates",
    latestNews:
      locale === "ar" ? "آخر الأخبار" : locale === "fr" ? "Dernières nouvelles" : "Latest News",
    featured:
      locale === "ar" ? "مميز" : locale === "fr" ? "À la une" : "Featured",
    exploreLabel:
      locale === "ar" ? "استكشف تحديثات النقابات في لبنان" :
      locale === "fr" ? "Explorez les actualités des syndicats du Liban" :
      "Explore syndicate updates from Lebanon",
    errorMsg:
      locale === "ar" ? "فشل تحميل الأخبار. يرجى تحديث الصفحة." :
      locale === "fr" ? "Échec du chargement. Veuillez actualiser." :
      "Failed to load news. Please try refreshing.",
    noNews:
      locale === "ar" ? "لا توجد أخبار." : locale === "fr" ? "Aucune actualité trouvée." : "No news found.",
    translating:
      locale === "ar" ? null :
      locale === "fr" ? "Traduction en cours…" :
      "Translating news…",
  };

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-12 text-center">
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-3">
            New News!!
          </h1>
          <p className="text-slate-500 text-base mb-8 max-w-md mx-auto">
            Check latest updates, decisions, and announcements from Lebanese professional syndicates.
          </p>

          {/* Hero search — searches by syndicate name */}
          <div className="max-w-xl mx-auto flex gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                value={filters.search}
                onChange={(e) =>
                  handleFiltersChange({ ...filters, search: e.target.value, syndicateId: "" })
                }
                placeholder="Search by syndicate name or keyword..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
              />
            </div>
            <button className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm px-5 py-3 rounded-xl transition whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">

   


        {/* ── Main ── */}
        <main className="flex-1 min-w-0">

          {/* Header row */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-blue-700">Latest News</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Explore suggested syndicate updates
              </p>
            </div>
          </div>

          {/* Filters bar */}
          <div className="mb-6">
            <NewsFilters
              filters={filters}
              onChange={handleFiltersChange}
              syndicates={SYNDICATES}
              totalResults={filtered.length}
            />
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No news found for your search.</p>
              <button
                onClick={() => {
                  setActiveSyndicate(null);
                  setFilters({ search: "", syndicateId: "", contentType: "", sort: "latest" });
                }}
                className="mt-4 text-xs text-blue-700 underline underline-offset-2 hover:no-underline"
              >
                Clear filters
              </button>
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
              <p className="text-sm font-medium">{t.noNews}</p>
            </div>
          )}

          {/* News grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  onReadMore={setSelectedItem}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Modal ── */}
      <NewsDetailsModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}