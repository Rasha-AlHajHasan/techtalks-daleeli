import { supabase } from "@/app/lib/supabase/client";
import { notFound } from "next/navigation";
export type Syndicate = {
  id: string;
  name: string;
  slug: string;
  description_ar: string | null;
};

export type Requirement = {
  title_ar: string | null;
  description_ar: string | null;
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
  params: { slug: string };
};

export default async function Page({ params }: Props) {
  const { slug } = await params;

  // 1. Syndicate
  const { data: syndicateData } = await supabase
    .from("syndicates")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!syndicateData) return notFound();

  const syndicate = syndicateData as Syndicate;

  // 2. Requirements
  const { data: reqData } = await supabase
    .from("syndicate_requirements")
    .select("*")
    .eq("syndicate_id", syndicate.id)
    .eq("is_current", true)
    .single();

  const requirements = reqData as Requirement | null;

  // 3. Documents
  const { data: docsData } = await supabase
    .from("syndicate_required_documents")
    .select("*")
    .eq("syndicate_id", syndicate.id)
    .order("display_order");

  const documents = docsData as Document[];

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{syndicate.name}</h1>
        <p className="text-gray-600">{syndicate.description_ar}</p>
      </div>

      {/* Requirements */}
      {requirements && (
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {requirements.title_ar}
          </h2>

          <p className="mb-3">{requirements.description_ar}</p>

          <ul className="list-disc pl-6">
            {requirements.eligibility_conditions?.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Fees */}
      {requirements?.fees?.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">الرسوم</h2>

          <ul className="list-disc pl-6">
            {requirements?.fees.map((f, i) => (
              <li key={i}>
                {f.type}: {f.amount} {f.currency}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Documents */}
      <div>
        <h2 className="text-xl font-semibold mb-2">المستندات المطلوبة</h2>

        <ul className="list-disc pl-6">
          {documents.map((doc) => (
            <li key={doc.id}>{doc.name_ar}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
