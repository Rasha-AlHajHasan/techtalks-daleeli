import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

export type AuthenticatedRequestUser = {
  id: string;
  email: string | undefined;
};

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase env vars");
  }

  return createClient(url, key);
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export async function getAuthenticatedRequestUser(
  request: NextRequest,
): Promise<AuthenticatedRequestUser | null> {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}
