import { supabase } from "@/app/lib/supabase/client";

export type DBNewsItem = {
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
  status: string;
  language: string | null;
  is_active: boolean;
};

export type DBSyndicate = {
  id: string;
  name: string;
  slug: string;
  official_website: string | null;
  logo_url: string | null;
  description_ar: string | null;
  description_en: string | null;
  is_active: boolean;
};

export type SyndicateInfo = Pick<DBSyndicate, "id" | "name" | "slug" | "logo_url">;

export type NewsItemWithSyndicate = DBNewsItem & {
  syndicates: SyndicateInfo | null;
};

// ─── Translation-aware fetch ───────────────────────────────────────────────────
// Calls the API route which handles Claude translation at fetch time.
// Falls back to direct Supabase query (Arabic) if API route fails.

export async function getAllNews(locale: string = "ar"): Promise<NewsItemWithSyndicate[]> {
  try {
    const baseUrl =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
        : "";

    const res = await fetch(`${baseUrl}/api/news?locale=${locale}`, {
      next: { revalidate: 600, tags: [`news-${locale}`] },
    });

    if (!res.ok) throw new Error("API route failed");

    const { news } = await res.json();
    return news as NewsItemWithSyndicate[];
  } catch {
    // Fallback: fetch Arabic directly from Supabase
    return fetchNewsDirectly();
  }
}

// Internal — used as fallback, always returns Arabic (source language)
async function fetchNewsDirectly(): Promise<NewsItemWithSyndicate[]> {
  const { data, error } = await supabase
    .from("news_items")
    .select(`
      id,
      syndicate_id,
      title,
      slug,
      summary,
      content,
      source_url,
      image_url,
      published_at,
      fetched_at,
      status,
      language,
      is_active,
      syndicates (
        id,
        name,
        slug,
        logo_url
      )
    `)
    .eq("is_active", true)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as Array<DBNewsItem & { syndicates: SyndicateInfo[] | SyndicateInfo | null }>).map((item) => ({
    ...item,
    syndicates: Array.isArray(item.syndicates)
      ? (item.syndicates[0] ?? null)
      : (item.syndicates ?? null),
  })) as NewsItemWithSyndicate[];
}

// ─── Syndicate queries (unchanged) ────────────────────────────────────────────

/** Fetch a single syndicate by slug */
export async function getSyndicateBySlug(slug: string): Promise<DBSyndicate | null> {
  const { data, error } = await supabase
    .from("syndicates")
    .select("id, name, slug, official_website, logo_url, description_ar, description_en, is_active")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as DBSyndicate;
}

/** Fetch all published & active news items for a syndicate by its DB uuid */
export async function getNewsBySyndicateId(syndicateId: string): Promise<DBNewsItem[]> {
  const { data, error } = await supabase
    .from("news_items")
    .select(`
      id,
      syndicate_id,
      title,
      slug,
      summary,
      content,
      source_url,
      image_url,
      published_at,
      fetched_at,
      status,
      language,
      is_active
    `)
    .eq("syndicate_id", syndicateId)
    .eq("is_active", true)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as DBNewsItem[];
}

/** Fetch all active syndicates with their published news count */
export async function getSyndicatesWithCount() {
  const { data, error } = await supabase
    .from("syndicates")
    .select(`
      id,
      name,
      slug,
      logo_url,
      news_items!inner (count)
    `)
    .eq("is_active", true)
    .eq("news_items.is_active", true)
    .eq("news_items.status", "published");

  if (error) {
    // Fallback without inner join filters if above fails
    const { data: fallback, error: fallbackError } = await supabase
      .from("syndicates")
      .select(`id, name, slug, logo_url`)
      .eq("is_active", true);

    if (fallbackError) throw fallbackError;

    return (fallback ?? []).map((s: any) => ({
      id: s.slug,
      name: s.name,
      slug: s.slug,
      logo_url: s.logo_url ?? null,
      count: 0,
    }));
  }

  return (data ?? []).map((s: any) => ({
    id: s.slug,
    name: s.name,
    slug: s.slug,
    logo_url: s.logo_url ?? null,
    count: s.news_items?.[0]?.count ?? 0,
  }));
}

/** Fetch all active syndicates (for directory page) */
export async function getAllSyndicates(): Promise<DBSyndicate[]> {
  const { data, error } = await supabase
    .from("syndicates")
    .select("id, name, slug, official_website, logo_url, description_ar, description_en, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) return [];
  return (data ?? []) as DBSyndicate[];
}