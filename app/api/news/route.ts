import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/app/lib/auth/request-user";
import type {
  DBNewsItem,
  NewsItemWithSyndicate,
  SyndicateInfo,
} from "@/app/lib/news/queries";

// ─── Language map ─────────────────────────────────────────────────────────────
const LANGUAGE_MAP: Record<string, string> = {
  ar: "ar",
  en: "en",
  fr: "fr",
};

const FIELDS_TO_TRANSLATE = ["title", "summary", "content"] as const;
type TranslatableField = (typeof FIELDS_TO_TRANSLATE)[number];

// ─── MyMemory single request ──────────────────────────────────────────────────
// MyMemory limit: 500 chars per request.
// We use a SEPARATOR that is very unlikely to appear in Arabic news text.

async function myMemoryRequest(
  text: string,
  targetLang: string,
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
async function translateField(
  text: string,
  targetLang: string,
): Promise<string> {
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
    chunks.map((chunk) => myMemoryRequest(chunk, targetLang)),
  );

  return translated.join(" ");
}

// ─── Translate one news item — all 3 fields in parallel ──────────────────────
async function translateNewsItem(
  item: NewsItemWithSyndicate,
  targetLang: string,
): Promise<NewsItemWithSyndicate> {
  const translated: NewsItemWithSyndicate = { ...item };

  // Fire title, summary, content all at the same time
  const results = await Promise.allSettled(
    FIELDS_TO_TRANSLATE.map((field) =>
      item[field as TranslatableField]
        ? translateField(item[field as TranslatableField] as string, targetLang)
        : Promise.resolve(item[field as TranslatableField] as string),
    ),
  );

  FIELDS_TO_TRANSLATE.forEach((field, i) => {
    const result = results[i];
    if (result.status === "fulfilled") {
      if (field === "title") {
        translated.title = result.value ?? item.title;
      } else if (field === "summary") {
        translated.summary = result.value;
      } else {
        translated.content = result.value;
      }
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
  targetLang: string,
): Promise<NewsItemWithSyndicate[]> {
  const results: NewsItemWithSyndicate[] = [];

  for (let i = 0; i < news.length; i += BATCH_SIZE) {
    const batch = news.slice(i, i + BATCH_SIZE);

    // All articles in this batch translate in parallel
    const batchResults = await Promise.all(
      batch.map((item) => translateNewsItem(item, targetLang)),
    );

    results.push(...batchResults);
  }

  return results;
}

// ─── GET /api/news?locale=en ──────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "ar";
  const syndicate = searchParams.get("syndicate");
  const syndicateId = searchParams.get("syndicate_id");
  const limitParam = Number(searchParams.get("limit"));
  const limit =
    Number.isInteger(limitParam) && limitParam > 0
      ? Math.min(limitParam, 100)
      : null;

  if (!LANGUAGE_MAP[locale]) {
    return NextResponse.json(
      { error: `Unsupported locale: ${locale}` },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServerClient();
  const syndicatesJoin = syndicate ? "syndicates!inner" : "syndicates";

  let query = supabase
    .from("news_items")
    .select(
      `
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
      ${syndicatesJoin} (
        id,
        name,
        slug,
        logo_url
      )
    `,
    )
    .eq("is_active", true)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (syndicateId) {
    query = query.eq("syndicate_id", syndicateId);
  }

  if (syndicate) {
    query = query.eq("syndicates.slug", syndicate);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

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

// ─── POST /api/news ───────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("news_items")
      .insert([
        {
          title: body.title,
          summary: body.summary || "",
          content: body.content || "",
          source_url: body.source_url || "",
          published_at: body.published_at || new Date().toISOString(),
          content_type: body.content_type || "news",
          is_active: true,
          status: "published",
          language: "ar",
        }
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json(
      { error: "Failed to create news article" },
      { status: 500 }
    );
  }
}
