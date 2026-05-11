"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Calendar, ExternalLink, Newspaper, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/app/lib/supabase/browser";

type SyndicateInfo = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
};

type NotificationNewsItem = {
  id: string;
  syndicate_id: string;
  title: string;
  slug: string | null;
  summary: string | null;
  content: string | null;
  source_url: string | null;
  image_url: string | null;
  published_at: string | null;
  fetched_at: string;
  syndicates: SyndicateInfo | null;
};

function formatDate(date: string | null) {
  if (!date) return "Latest update";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NewsNotificationModal() {
  const [news, setNews] = useState<NotificationNewsItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const newsSignature = useMemo(
    () => news.map((item) => item.id).join(":"),
    [news],
  );

  const loadLatestSubscribedNews = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setNews([]);
        setOpen(false);
        return;
      }

      const res = await fetch("/api/news/subscriptions/latest?limit=3", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) return;

      const body = (await res.json()) as { news?: NotificationNewsItem[] };
      const latestNews = body.news ?? [];
      const signature = latestNews.map((item) => item.id).join(":");
      const dismissedKey = `daleeli-news-notification:${session.user.id}:${signature}`;

      if (!latestNews.length || sessionStorage.getItem(dismissedKey)) {
        setNews([]);
        setOpen(false);
        return;
      }

      setNews(latestNews);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLatestSubscribedNews();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        void loadLatestSubscribedNews();
      }

      if (event === "SIGNED_OUT") {
        setNews([]);
        setOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadLatestSubscribedNews]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  });

  const handleClose = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user.id && newsSignature) {
      sessionStorage.setItem(
        `daleeli-news-notification:${session.user.id}:${newsSignature}`,
        "dismissed",
      );
    }

    setOpen(false);
  };

  if (!open || loading || news.length === 0) return null;

  const lead = news[0];

  return (
    <div
      className="fixed inset-0 z-120 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) void handleClose();
      }}
    >
      <section className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Bell className="size-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                News Notification
              </p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">
                Latest from your syndicate
              </h2>
            </div>
          </div>
          <button
            onClick={() => void handleClose()}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close news notification"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-82px)] overflow-y-auto">
          <article className="grid gap-0 border-b border-slate-100 md:grid-cols-[220px_1fr]">
            <div className="relative min-h-44 bg-slate-100">
              {lead.image_url ? (
                <Image
                  src={lead.image_url}
                  alt={lead.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full min-h-44 items-center justify-center text-slate-300">
                  <Newspaper className="size-12" />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                  {lead.syndicates?.name ?? "Subscribed syndicate"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {formatDate(lead.published_at ?? lead.fetched_at)}
                </span>
              </div>
              <h3 className="text-lg font-bold leading-snug text-slate-950">
                {lead.title}
              </h3>
              {lead.summary && (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {lead.summary}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild className="h-9 px-4">
                  <Link href="/news" onClick={() => void handleClose()}>
                    View News
                  </Link>
                </Button>
                {lead.source_url && (
                  <Button asChild variant="outline" className="h-9 px-4">
                    <a
                      href={lead.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" />
                      Source
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </article>

          {news.length > 1 && (
            <div className="space-y-3 p-5">
              {news.slice(1).map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-blue-700">
                      {item.syndicates?.name ?? "Subscribed syndicate"}
                    </span>
                    <span>{formatDate(item.published_at ?? item.fetched_at)}</span>
                  </div>
                  <h4 className="text-sm font-bold leading-snug text-slate-900">
                    {item.title}
                  </h4>
                  {item.summary && (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
                      {item.summary}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
