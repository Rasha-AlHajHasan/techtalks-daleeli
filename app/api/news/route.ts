import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { DBNewsItem, NewsItemWithSyndicate, SyndicateInfo } from "@/lib/news/queries";

// ─── Language map ─────────────────────────────────────────────────────────────
const LANGUAGE_MAP: Record<string, string> = {
  ar: "ar",
  en: "en",
  fr: "fr",
};

const FIELDS_TO_TRANSLATE = ["title", "summary", "content"] as const;
type TranslatableField = (typeof FIELDS_TO_TRANSLATE)[number];

// ─── Supabase server client ───────────────────────────────────────────────────
function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase env vars");
  }

  return createClient(url, key);
}

// ─── MyMemory single request ──────────────────────────────────────────────────
// MyMemory limit: 500 chars per request.
// We use a SEPARATOR that is very unlikely to appear in Arabic news text.
const SEPARATOR = " ||| ";

async function myMemoryRequest(
  text: string,
  targetLang: string
): Promise<string> {
  const email = process.env.MYMEMORY_EMAIL
    ? `&de=${process.env.MYMEMORY_EMAIL}`
    : "";

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ar|${targetLang}${email}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) return text;

  const data = await res.json();

  if (data.responseStatus === 200 && data.responseData?.translatedText) {
    return data.responseData.translatedText;
  }

  return text;
}

// ─── Translate a single field (splits into 490-char chunks if needed) ─────────
async function translateField(text: string, targetLang: string): Promise<string> {
  if (!text?.trim()) return text;
  if (text.length <= 490) return myMemoryRequest(text, targetLang);

  // Split long text at word boundaries into ≤490-char chunks
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 490) {
    let splitAt = remaining.lastIndexOf(" ", 490);
    if (splitAt === -1) splitAt = 490;
    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }
  if (remaining) chunks.push(remaining);

  // Translate all chunks of this field in parallel
  const translated = await Promise.all(
    chunks.map((chunk) => myMemoryRequest(chunk, targetLang))
  );

  return translated.join(" ");
}

// ─── Translate one news item — all 3 fields in parallel ──────────────────────
async function translateNewsItem(
  item: NewsItemWithSyndicate,
  targetLang: string
): Promise<NewsItemWithSyndicate> {
  const translated = { ...item };

  // Fire title, summary, content all at the same time
  const results = await Promise.allSettled(
    FIELDS_TO_TRANSLATE.map((field) =>
      item[field as TranslatableField]
        ? translateField(item[field as TranslatableField] as string, targetLang)
        : Promise.resolve(item[field as TranslatableField] as string)
    )
  );

  FIELDS_TO_TRANSLATE.forEach((field, i) => {
    const result = results[i];
    if (result.status === "fulfilled") {
      (translated as any)[field] = result.value;
    }
    // On rejection keep original Arabic text
  });

  return translated;
}

// ─── Translate all news in parallel batches ───────────────────────────────────
// MyMemory allows concurrent requests — we process in batches of 5 articles
// at a time to stay well within rate limits while being fast.
const BATCH_SIZE = 5;

async function translateAllNews(
  news: NewsItemWithSyndicate[],
  targetLang: string
): Promise<NewsItemWithSyndicate[]> {
  const results: NewsItemWithSyndicate[] = [];

  for (let i = 0; i < news.length; i += BATCH_SIZE) {
    const batch = news.slice(i, i + BATCH_SIZE);

    // All articles in this batch translate in parallel
    const batchResults = await Promise.all(
      batch.map((item) => translateNewsItem(item, targetLang))
    );

    results.push(...batchResults);
  }

  return results;
}

// ─── GET /api/news?locale=en ──────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "ar";

  if (!LANGUAGE_MAP[locale]) {
    return NextResponse.json(
      { error: `Unsupported locale: ${locale}` },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServer();

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

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Normalize syndicates join
  const news = (
    (data ?? []) as Array<
      DBNewsItem & { syndicates: SyndicateInfo[] | SyndicateInfo | null }
    >
  ).map((item) => ({
    ...item,
    syndicates: Array.isArray(item.syndicates)
      ? (item.syndicates[0] ?? null)
      : (item.syndicates ?? null),
  })) as NewsItemWithSyndicate[];

  // Arabic — return immediately, no translation needed
  if (locale === "ar") {
    return NextResponse.json({ news });
  }

  try {
    const translatedNews = await translateAllNews(news, LANGUAGE_MAP[locale]);
    return NextResponse.json({ news: translatedNews });
  } catch (translationError) {
    console.error("Translation error:", translationError);
    return NextResponse.json({ news }); // fallback: return Arabic
  }
}