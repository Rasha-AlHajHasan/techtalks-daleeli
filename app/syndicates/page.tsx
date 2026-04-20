"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  Scale,
  Stethoscope,
  HardHat,
  Calculator,
  FlaskConical,
} from "lucide-react";
import SyndicateCard from "../components/Cards/SyndicateCard";

const syndicates = [
  {
    id: "bar-beirut",
    name: "Beirut Bar Association",
    sector: "Legal",
    members: "8,200+",
    desc: "The premier legal syndicate for lawyers in the Beirut district, offering comprehensive professional regulation.",
    Icon: Scale,
    image:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "physicians",
    name: "Order of Physicians",
    sector: "Healthcare",
    members: "14,000+",
    desc: "Regulating medical practices and ethics across the Lebanese territory.",
    Icon: Stethoscope,
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "engineers",
    name: "Order of Engineers & Architects",
    sector: "Engineering",
    members: "20,000+",
    desc: "Professional body ensuring structural safety and engineering standards.",
    Icon: HardHat,
    image:
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "accountants",
    name: "Association of Accountants",
    sector: "Finance",
    members: "4,100+",
    desc: "Maintaining fiscal transparency and international accounting standards.",
    Icon: Calculator,
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "bar-tripoli",
    name: "Tripoli Bar Association",
    sector: "Legal",
    members: "3,500+",
    desc: "Serving legal practitioners in North Lebanon.",
    Icon: Scale,
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "pharmacists",
    name: "Order of Pharmacists",
    sector: "Healthcare",
    members: "6,300+",
    desc: "Regulating pharmaceutical practice and safety.",
    Icon: FlaskConical,
    image:
      "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=800",
  },
];

const SECTORS = ["All", "Legal", "Healthcare", "Engineering", "Finance"];

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
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <section className="bg-slate-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-12 items-center lg:items-stretch min-h-130">
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-700 mb-6 block">
              Lebanese Professional Syndicate Authority
            </span>

            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-slate-900">
              Select Your Professional{" "}
              <span className="text-blue-700">Syndicate</span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-md mb-8">
              Access the official registry of Lebanese professional orders.
              Browse requirements, verify memberships, and manage affiliations.
            </p>

            <a
              href="#directory"
              className="inline-flex w-fit bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
            >
              Browse Directory
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
            placeholder="Search syndicates..."
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {SECTORS.map((sector) => {
            const isActive = activeSector === sector;

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
                {sector}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="directory"
        className="max-w-7xl mx-auto px-8 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filtered.map((syn) => (
          <SyndicateCard key={syn.id} syn={syn} />
        ))}
      </div>
    </div>
  );
}
