"use client";

import Link from "next/link";

interface Syndicate {
  id: string;
  name: string;
  sector: string;
  members: string;
  desc: string;
}

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

export default function SyndicateCard({ syndicate }: { syndicate: Syndicate }) {
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
