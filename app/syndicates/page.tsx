"use client";

import Link from "next/link";
import { useState } from "react";

interface Syndicate {
  id: string;
  name: string;
  sector: string;
  members: string;
  desc: string;
}

const syndicates: Syndicate[] = [
  {
    id: "bar-beirut",
    name: "Beirut Bar Association",
    sector: "Legal",
    members: "8,200+",
    desc: "The premier legal syndicate for lawyers in the Beirut district, offering comprehensive professional regulation.",
  },
  {
    id: "physicians",
    name: "Order of Physicians",
    sector: "Healthcare",
    members: "14,000+",
    desc: "Regulating medical practices and ethics across the Lebanese territory for registered medical doctors.",
  },
  {
    id: "engineers",
    name: "Order of Engineers & Architects",
    sector: "Engineering",
    members: "20,000+",
    desc: "Professional body for civil, mechanical, and electrical engineers ensuring structural safety.",
  },
  {
    id: "accountants",
    name: "Association of Accountants",
    sector: "Finance",
    members: "4,100+",
    desc: "Certified Public Accountants and auditors maintaining fiscal transparency and international standards.",
  },
  {
    id: "bar-tripoli",
    name: "Tripoli Bar Association",
    sector: "Legal",
    members: "3,500+",
    desc: "Serving legal practitioners in North Lebanon with tradition and modern advocacy support.",
  },
  {
    id: "pharmacists",
    name: "Order of Pharmacists",
    sector: "Healthcare",
    members: "6,300+",
    desc: "Ensuring public safety through the regulation of pharmacological sciences and distribution.",
  },
];

const SECTORS = ["All", "Legal", "Healthcare", "Engineering", "Finance"];

const SECTOR_STYLES: Record<
  string,
  {
    badge: string;
    icon: string;
    border: string;
    hover: string;
    btn: string;
    btnHover: string;
    filterActive: string;
  }
> = {
  Legal: {
    badge: "bg-[#EAF3DE] text-[#27500A]",
    icon: "bg-[#EAF3DE] text-[#3B6D11]",
    border: "hover:border-l-[#3B6D11]",
    hover: "hover:bg-[#f4f9ec]",
    btn: "border-[#3B6D11] text-[#3B6D11]",
    btnHover: "group-hover:bg-[#3B6D11] group-hover:text-white",
    filterActive: "bg-[#EAF3DE] text-[#27500A] border-[#3B6D11]/30",
  },
  Healthcare: {
    badge: "bg-[#E1F5EE] text-[#085041]",
    icon: "bg-[#E1F5EE] text-[#0F6E56]",
    border: "hover:border-l-[#0F6E56]",
    hover: "hover:bg-[#edf8f4]",
    btn: "border-[#0F6E56] text-[#0F6E56]",
    btnHover: "group-hover:bg-[#0F6E56] group-hover:text-white",
    filterActive: "bg-[#E1F5EE] text-[#085041] border-[#0F6E56]/30",
  },
  Engineering: {
    badge: "bg-[#FAEEDA] text-[#633806]",
    icon: "bg-[#FAEEDA] text-[#854F0B]",
    border: "hover:border-l-[#854F0B]",
    hover: "hover:bg-[#fdf6ec]",
    btn: "border-[#854F0B] text-[#854F0B]",
    btnHover: "group-hover:bg-[#854F0B] group-hover:text-white",
    filterActive: "bg-[#FAEEDA] text-[#633806] border-[#854F0B]/30",
  },
  Finance: {
    badge: "bg-[#E6F1FB] text-[#0C447C]",
    icon: "bg-[#E6F1FB] text-[#185FA5]",
    border: "hover:border-l-[#185FA5]",
    hover: "hover:bg-[#edf4fc]",
    btn: "border-[#185FA5] text-[#185FA5]",
    btnHover: "group-hover:bg-[#185FA5] group-hover:text-white",
    filterActive: "bg-[#E6F1FB] text-[#0C447C] border-[#185FA5]/30",
  },
};

const DEFAULT_STYLE = {
  badge: "bg-[#e6e8ea] text-[#44474d]",
  icon: "bg-[#f2f4f6] text-[#44474d]",
  border: "hover:border-l-[#888]",
  hover: "hover:bg-[#f7f8f9]",
  btn: "border-[#888] text-[#888]",
  btnHover: "group-hover:bg-[#888] group-hover:text-white",
  filterActive: "",
};

export function SyndicateCard({ syndicate }: { syndicate: Syndicate }) {
  const styles = SECTOR_STYLES[syndicate.sector] ?? DEFAULT_STYLE;

  return (
    <Link
      href={`/syndicates/${syndicate.id}`}
      className={`group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white border border-[#c5c6ce]/20 border-l-[3px] border-l-transparent rounded-2xl p-6 transition-all duration-150 ${styles.border} ${styles.hover}`}
    >
      <div className="flex items-center gap-5">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm font-display shrink-0 ${styles.icon}`}
        >
          {syndicate.name.substring(0, 2).toUpperCase()}
        </div>

        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h3 className="text-base font-bold text-primary font-display">
              {syndicate.name}
            </h3>
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${styles.badge}`}
            >
              {syndicate.sector}
            </span>
          </div>
          <p className="text-sm text-[#44474d] max-w-xl leading-relaxed">
            {syndicate.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5 shrink-0">
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#75777e] mb-0.5">
            Members
          </p>
          <p className="font-black text-primary font-display text-lg">
            {syndicate.members}
          </p>
        </div>
        <div
          className={`px-4 py-2 rounded-lg text-sm font-bold border whitespace-nowrap transition-colors duration-150 ${styles.btn} ${styles.btnHover}`}
        >
          View details →
        </div>
      </div>
    </Link>
  );
}

export default function SyndicateDirectory() {
  const [search, setSearch] = useState("");
  const [activeSector, setActiveSector] = useState("All");

  const filtered = syndicates.filter((s) => {
    const matchesSector = activeSector === "All" || s.sector === activeSector;
    const matchesSearch =
      search.trim().length === 0 ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.sector.toLowerCase().includes(search.toLowerCase());
    return matchesSector && matchesSearch;
  });

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-8 pt-12 pb-10">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-3 block">
          Directory
        </span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <h1 className="text-5xl font-extrabold tracking-tighter text-primary font-display leading-tight">
            Professional Syndicates
          </h1>
          <p className="text-[#44474d] max-w-md text-sm leading-relaxed">
            Access the official registry of Lebanese professional orders. Browse
            requirements, verify memberships, and manage institutional
            affiliations.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative max-w-lg">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777e]"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search syndicates..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c5c6ce]/30 bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 text-primary placeholder:text-[#a0a3a8] text-sm"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {SECTORS.map((sector) => {
              const isActive = activeSector === sector;
              const sectorStyle =
                sector !== "All" ? SECTOR_STYLES[sector] : null;

              return (
                <button
                  key={sector}
                  onClick={() => setActiveSector(sector)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-100 ${
                    isActive
                      ? sector === "All"
                        ? "bg-[#1a2b48] text-white border-[#1a2b48]"
                        : sectorStyle?.filterActive
                      : "bg-white text-[#44474d] border-[#c5c6ce]/40 hover:border-[#c5c6ce] hover:text-primary"
                  }`}
                >
                  {sector}
                </button>
              );
            })}
            <span className="text-xs text-[#a0a3a8] ml-1">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#75777e] text-sm">
            No syndicates match your search.
          </div>
        ) : (
          filtered.map((syn) => <SyndicateCard key={syn.id} syndicate={syn} />)
        )}
      </div>
    </div>
  );
}
