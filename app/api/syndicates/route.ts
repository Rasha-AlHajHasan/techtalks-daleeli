import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { BackendSyndicate } from "@/app/[locale]/(main)/syndicates/page";

// ─── Language map ─────────────────────────────────────────────────────────────
const LANGUAGE_MAP: Record<string, string> = {
  ar: "ar",
  en: "en",
  fr: "fr",
};

// We target the specific fields in your BackendSyndicate type
const FIELDS_TO_TRANSLATE = ["name", "description_ar"] as const;
type TranslatableField = (typeof FIELDS_TO_TRANSLATE)[number];

// ─── MyMemory Translation Helpers ──────────────────────────────────────────────
async function myMemoryRequest(
  text: string,
  targetLang: string,
): Promise<string> {
  const email = process.env.MYMEMORY_EMAIL
    ? `&de=${process.env.MYMEMORY_EMAIL}`
    : "";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ar|${targetLang}${email}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return text;

  const data = await res.json();
  if (data.responseStatus === 200 && data.responseData?.translatedText) {
    return data.responseData.translatedText;
  }
  return text;
}

async function translateField(
  text: string,
  targetLang: string,
): Promise<string> {
  if (!text?.trim()) return text;
  if (text.length <= 490) return myMemoryRequest(text, targetLang);

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 490) {
    let splitAt = remaining.lastIndexOf(" ", 490);
    if (splitAt === -1) splitAt = 490;
    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }
  if (remaining) chunks.push(remaining);

  const translated = await Promise.all(
    chunks.map((chunk) => myMemoryRequest(chunk, targetLang)),
  );

  return translated.join(" ");
}

// ─── Syndicate Specific Translation Logic ──────────────────────────────────────
async function translateSyndicate(
  syn: BackendSyndicate,
  targetLang: string,
): Promise<BackendSyndicate> {
  const translated = { ...syn };

  const results = await Promise.allSettled(
    FIELDS_TO_TRANSLATE.map((field) =>
      syn[field]
        ? translateField(syn[field] as string, targetLang)
        : Promise.resolve(syn[field] as string),
    ),
  );

  FIELDS_TO_TRANSLATE.forEach((field, i) => {
    const result = results[i];
    if (result.status === "fulfilled") {
      (translated as any)[field] = result.value;
    }
  });

  return translated;
}

const BATCH_SIZE = 5;

async function translateAllSyndicates(
  syndicates: BackendSyndicate[],
  targetLang: string,
): Promise<BackendSyndicate[]> {
  const results: BackendSyndicate[] = [];

  for (let i = 0; i < syndicates.length; i += BATCH_SIZE) {
    const batch = syndicates.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((syn) => translateSyndicate(syn, targetLang)),
    );
    results.push(...batchResults);
  }

  return results;
}

// ─── Main API Route ────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "ar";

  if (!LANGUAGE_MAP[locale]) {
    return NextResponse.json(
      { error: `Unsupported locale: ${locale}` },
      { status: 400 },
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase
    .from("syndicates")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const syndicates = data as BackendSyndicate[];

  // If Arabic, return immediately without translation
  if (locale === "ar") {
    return NextResponse.json({ syndicates });
  }

  try {
    const translatedSyndicates = await translateAllSyndicates(
      syndicates,
      LANGUAGE_MAP[locale],
    );
    return NextResponse.json({ syndicates: translatedSyndicates });
  } catch (translationError) {
    console.error("Translation error:", translationError);
    // Fallback: return Arabic if translation fails
    return NextResponse.json({ syndicates });
  }
}
