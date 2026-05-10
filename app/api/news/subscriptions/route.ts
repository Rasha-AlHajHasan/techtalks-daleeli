import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedRequestUser,
  getSupabaseServerClient,
} from "@/app/lib/auth/request-user";

type SubscriptionRequestBody = {
  syndicate_id?: string;
  subscribe_to_news?: boolean;
};

const SUBSCRIPTION_SELECT = `
  id,
  user_id,
  syndicate_id,
  is_subscribed,
  created_at,
  updated_at,
  syndicates (
    id,
    name,
    slug,
    logo_url
  )
`;

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedRequestUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_news_preferences")
    .select(SUBSCRIPTION_SELECT)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscriptions: data ?? [] });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedRequestUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SubscriptionRequestBody;

  if (!body.syndicate_id) {
    return NextResponse.json(
      { error: "syndicate_id is required" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServerClient();
  const { data: syndicate, error: syndicateError } = await supabase
    .from("syndicates")
    .select("id")
    .eq("id", body.syndicate_id)
    .eq("is_active", true)
    .maybeSingle();

  if (syndicateError) {
    return NextResponse.json({ error: syndicateError.message }, { status: 500 });
  }

  if (!syndicate) {
    return NextResponse.json(
      { error: "Syndicate not found" },
      { status: 404 },
    );
  }

  const { data, error } = await supabase
    .from("user_news_preferences")
    .upsert(
      {
        user_id: user.id,
        syndicate_id: body.syndicate_id,
        is_subscribed: body.subscribe_to_news ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,syndicate_id" },
    )
    .select(SUBSCRIPTION_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscription: data });
}
