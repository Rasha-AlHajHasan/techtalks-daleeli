import { supabase } from "@/app/lib/supabase/client";
import { notFound } from "next/navigation";
import PageUI from "./pageUI";

export type Syndicate = {
  id: string;
  name: string;
  slug: string;
  description_ar: string | null;
  description_en?: string | null;
  official_website?: string | null;
  logo_url?: string | null;
  is_active?: boolean;
};

export type Requirement = {
  title_ar: string | null;
  title_en?: string | null;
  description_ar: string | null;
  description_en?: string | null;
  eligibility_conditions: string[];
  fees: {
    type: string;
    amount: number;
    currency: string;
  }[];
};

export type Document = {
  id: string;
  name_ar: string;
  display_order: number;
};

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function SyndicateDetailPage({ params }: Props) {
  const { slug, locale } = await params;

  const { data: syndicateData, error: synError } = await supabase
    .from("syndicates")
    .select("*")
    .eq("slug", slug)
    .single();

  if (synError || !syndicateData) {
    return notFound();
  }

  const syndicate = syndicateData as Syndicate;

  const [reqResponse, docsResponse] = await Promise.all([
    supabase
      .from("syndicate_requirements")
      .select("*")
      .eq("syndicate_id", syndicate.id)
      .eq("is_current", true)
      .single(),
    supabase
      .from("syndicate_required_documents")
      .select("*")
      .eq("syndicate_id", syndicate.id)
      .order("display_order"),
  ]);

  const requirements = (reqResponse.data as Requirement) || null;
  const documents = (docsResponse.data as Document[]) || [];

  return (
    <PageUI
      syndicate={syndicate}
      requirements={requirements}
      documents={documents}
      locale={locale}
    />
  );
}
