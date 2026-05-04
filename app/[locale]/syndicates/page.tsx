import Link from "next/link";
import { supabase } from "@/app/lib/supabase/client";

export type Syndicate = {
  id: string;
  name: string;
  slug: string;
  description_ar: string | null;
};

export default async function Home() {
  const { data, error } = await supabase
    .from("syndicates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return <div>Error loading data</div>;

  const syndicates = data as Syndicate[];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">النقابات</h1>

      <div className="grid gap-4">
        {syndicates.map((s) => (
          <Link
            key={s.id}
            href={`/syndicates/${s.slug}`}
            className="border p-4 rounded hover:bg-gray-50"
          >
            <h2 className="text-lg font-semibold">{s.name}</h2>
            <p className="text-sm text-gray-600">{s.description_ar}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
