import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedRequestUser,
  getSupabaseServerClient,
} from "@/app/lib/auth/request-user";
import type {
  DBNewsItem,
  NewsItemWithSyndicate,
  SyndicateInfo,
} from "@/app/lib/news/queries";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedRequestUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit"));
  const limit =
    Number.isInteger(limitParam) && limitParam > 0
      ? Math.min(limitParam, 20)
      : 5;

  const supabase = getSupabaseServerClient();
  const { data: preferences, error: preferencesError } = await supabase
    .from("user_news_preferences")
    .select(
      `
      syndicate_id,
      is_subscribed,
      syndicates (
        id,
        name,
        slug,
        logo_url
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("is_subscribed", true);

  if (preferencesError) {
    return NextResponse.json(
      { error: preferencesError.message },
      { status: 500 },
    );
  }

  const syndicateIds = [
    ...new Set((preferences ?? []).map((preference) => preference.syndicate_id)),
  ];

  if (syndicateIds.length === 0) {
    return NextResponse.json({ subscriptions: [], news: [] });
  }

  const { data, error } = await supabase
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
      syndicates (
        id,
        name,
        slug,
        logo_url
      )
    `,
    )
    .in("syndicate_id", syndicateIds)
    .eq("is_active", true)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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

  return NextResponse.json({
    subscriptions: preferences ?? [],
    news,
  });
}
