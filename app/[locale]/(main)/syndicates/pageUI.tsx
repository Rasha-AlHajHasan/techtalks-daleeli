"use client";

import { useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import SyndicateCard from "../../../components/Cards/SyndicateCard";
import { BackendSyndicate } from "./page";

const SECTORS = ["All", "Legal", "Healthcare", "Engineering", "Finance"];

interface PageUIProps {
  initialData: BackendSyndicate[];
}

export default function PageUI({ initialData }: PageUIProps) {
  const t = useTranslations("syndicates");

  const [search, setSearch] = useState("");
  const [activeSector, setActiveSector] = useState("All");

  const filtered = initialData.filter((s) => {
    const matchesSector = activeSector === "All" || s.sector === activeSector;

    const searchLower = search.trim().toLowerCase();
    const matchesSearch =
      searchLower.length === 0 ||
      s.name.toLowerCase().includes(searchLower) ||
      (s.description_ar &&
        s.description_ar.toLowerCase().includes(searchLower));

    return matchesSector && matchesSearch;
  });

  const getSectorLabel = (sector: string) => {
    if (sector === "All") return t("filters.sectors.all");
    if (sector === "Legal") return t("filters.sectors.legal");
    if (sector === "Healthcare") return t("filters.sectors.healthcare");
    if (sector === "Engineering") return t("filters.sectors.engineering");
    if (sector === "Finance") return t("filters.sectors.finance");
    return sector;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <section className="bg-slate-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-12 items-center lg:items-stretch min-h-130">
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-700 mb-6 block">
              {t("hero.badge")}
            </span>

            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-slate-900">
              {t("hero.title")}{" "}
              <span className="text-blue-700">{t("hero.titleHighlight")}</span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-md mb-8">
              {t("hero.description")}
            </p>

            <a
              href="#directory"
              className="inline-flex w-fit bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
            >
              {t("hero.cta")}
            </a>
          </div>

          <div className="relative">
            <div className="relative h-105 lg:h-full w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <Image
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200"
                alt="Professional collaboration"
                fill
                className="object-cover object-center"
                priority
              />
            </div>

            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 rounded-xl -z-10"></div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 pt-12 pb-8">
        <div className="relative max-w-xl mb-6">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("filters.searchPlaceholder")}
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {SECTORS.map((sector) => {
            const isActive = activeSector === sector;
            const sectorLabel = getSectorLabel(sector);

            return (
              <button
                key={sector}
                onClick={() => setActiveSector(sector)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-700 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {sectorLabel}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Syndicate Directory
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Showing {filtered.length} registered organizations
        </p>
      </div>

      <div
        id="directory"
        className="max-w-7xl mx-auto px-8 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filtered.length > 0 ? (
          filtered.map((syn) => <SyndicateCard key={syn.id} syn={syn} />)
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
            No syndicates found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
