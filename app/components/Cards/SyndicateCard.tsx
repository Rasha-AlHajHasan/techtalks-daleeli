"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LucideIcon } from "lucide-react";

export interface Syndicate {
  id: string;
  name: string;
  sector: string;
  members: string;
  desc: string;
  Icon: LucideIcon;
  image: string;
}

export default function SyndicateCard({ syn }: { syn: Syndicate }) {
  const Icon = syn.Icon;

  return (
    <Link
      href={`/syndicates/${syn.id}`}
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-md transition"
    >
      <div className="h-44 relative overflow-hidden">
        <Image
          src={syn.image}
          alt={syn.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
          <Icon size={14} className="text-blue-700" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
            {syn.sector}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-700 transition">
          {syn.name}
        </h3>

        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {syn.desc}
        </p>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
          <div>
            <p className="text-[10px] uppercase text-slate-400">Members</p>
            <p className="font-bold text-slate-900">{syn.members}</p>
          </div>

          <div className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}
