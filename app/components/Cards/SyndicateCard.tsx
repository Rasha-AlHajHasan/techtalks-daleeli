"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

export interface BackendSyndicate {
  id: string;
  name: string;
  slug: string;
  official_website?: string | null;
  logo_url?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  is_active?: boolean;
}

export default function SyndicateCard({ syn }: { syn: BackendSyndicate }) {
  const params = useParams();
  const locale = params.locale;

  return (
    <Link
      href={`/${locale}/syndicates/${syn.slug}`}
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-md transition flex flex-col h-full"
    >
      <div className="h-44 w-full bg-white border-b border-slate-100 p-6 flex items-center justify-center overflow-hidden">
        {syn.logo_url ? (
          <div className="relative w-full h-full">
            <Image
              src={syn.logo_url}
              alt={syn.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 text-sm">
            No Image
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-700 transition line-clamp-2">
          {syn.name}
        </h3>

        <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3">
          {syn.description_ar || "لا يوجد وصف متاح."}
        </p>

        <div className="flex items-center justify-end mt-auto pt-6">
          <div className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-700 group-hover:text-white transition">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}
