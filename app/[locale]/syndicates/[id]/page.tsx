    import { notFound } from "next/navigation";
    import Link from "next/link";
    import {
    ArrowLeft,
    Calendar,
    ExternalLink,
    Newspaper,
    Users,
    ChevronRight,
    Globe,
    } from "lucide-react";
    import { getSyndicateBySlug, getNewsBySyndicateId } from "@/lib/news/queries";

    // ─── Helpers ──────────────────────────────────────────────────────────────────
    function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    }

    function isToday(dateStr?: string | null) {
    if (!dateStr) return false;
    return dateStr.split("T")[0] === new Date().toISOString().split("T")[0];
    }

    // ─── Page ─────────────────────────────────────────────────────────────────────
    export default async function SyndicatePage({
    params,
    }: {
    params: Promise<{ id: string; locale: string }>;
    }) {
    const { id, locale } = await params;

    const syndicate = await getSyndicateBySlug(id);
    if (!syndicate) notFound();

    const newsItems = await getNewsBySyndicateId(syndicate.id);
    const initial = syndicate.name.charAt(0).toUpperCase();
    const description =
        locale === "ar" ? syndicate.description_ar : syndicate.description_en;

    return (
        <div className="min-h-screen bg-slate-50">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
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

            <div className="relative max-w-5xl mx-auto px-6 pt-10 pb-14">
            {/* Back link */}
            <Link
                href={`/${locale}/news`}
                className="inline-flex items-center gap-1.5 text-[#a8c0e0] hover:text-white text-xs font-semibold mb-8 transition"
            >
                <ArrowLeft size={14} />
                Back to News
            </Link>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar / Logo */}
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur overflow-hidden">
                {syndicate.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                    src={syndicate.logo_url}
                    alt={syndicate.name}
                    className="w-full h-full object-contain"
                    />
                ) : (
                    <span className="text-2xl font-extrabold text-white">
                    {initial}
                    </span>
                )}
                </div>

                <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                    {syndicate.name}
                </h1>
                {description && (
                    <p className="text-[#a8c0e0] text-sm mt-2 max-w-xl leading-relaxed">
                    {description}
                    </p>
                )}
                </div>
            </div>

            {/* Stats / links bar */}
            <div className="mt-8 flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                <Newspaper size={14} className="text-yellow-400" />
                <span className="text-white text-sm font-semibold">
                    {newsItems.length}
                </span>
                <span className="text-[#a8c0e0] text-xs">
                    {newsItems.length === 1 ? "article" : "articles"}
                </span>
                </div>

                {syndicate.official_website && (
                <a
                    href={syndicate.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#a8c0e0] hover:text-white text-xs font-semibold transition"
                >
                    <Globe size={13} className="text-yellow-400" />
                    Official Website
                </a>
                )}
            </div>
            </div>
        </section>

        {/* ── News Grid ─────────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-xl font-extrabold text-[#0d2240]">
                Latest Updates
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                All news and announcements from {syndicate.name}
                </p>
            </div>

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                <Link
                href={`/${locale}/news`}
                className="hover:text-[#1a3560] transition"
                >
                News
                </Link>
                <ChevronRight size={12} />
                <span className="text-slate-600 font-medium truncate max-w-[160px]">
                {syndicate.name}
                </span>
            </nav>
            </div>

            {newsItems.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
                <Newspaper size={44} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium">
                No news published yet for this syndicate.
                </p>
            </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {newsItems.map((item) => {
                const displayDate = item.published_at ?? item.fetched_at;
                const todayItem = isToday(displayDate);

                return (
                    <article
                    key={item.id}
                    className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#1a3560]/30 transition-all duration-300 flex flex-col"
                    >
                    {/* Today banner */}
                    {todayItem && (
                        <div className="bg-yellow-400 px-4 py-1.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-700 animate-pulse" />
                        <span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">
                            Today
                        </span>
                        </div>
                    )}

                    {/* Navy accent bar */}
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
                        <Newspaper size={28} className="text-[#1a3560]/20" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                        {item.language && (
                        <div className="mb-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200">
                            {item.language}
                            </span>
                        </div>
                        )}

                        <h3 className="text-sm font-bold text-[#0d2240] leading-snug mb-2 line-clamp-2 group-hover:text-[#2d5aa0] transition-colors">
                        {item.title}
                        </h3>

                        {item.summary && (
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-3 flex-1">
                            {item.summary}
                        </p>
                        )}

                        <div className="flex items-center justify-end mb-4">
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Calendar size={10} />
                            {formatDate(displayDate)}
                        </span>
                        </div>

                        {item.source_url && (
                        <div className="mt-auto pt-3 border-t border-slate-100">
                            <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg py-2 border border-slate-200 transition"
                            >
                            <ExternalLink size={11} />
                            View Source
                            </a>
                        </div>
                        )}
                    </div>
                    </article>
                );
                })}
            </div>
            )}
        </div>
        </div>
    );
    }