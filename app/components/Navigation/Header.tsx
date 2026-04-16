"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/syndicates", label: "Syndicates" },
  { href: "/news", label: "News" },
  { href: "/services/contract-review", label: "Services" },
  { href: "/about", label: "About" },
];

const Header = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#e6e8ea]">
      <div className="flex items-center justify-between h-14 max-w-7xl mx-auto px-8">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-primary hover:opacity-80 transition"
          >
            Daleeli
          </Link>

          <div className="hidden md:flex items-center ml-10 gap-6">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    isActive
                      ? "bg-[#1a2b48] text-white"
                      : "text-[#44474d] hover:bg-[#f2f4f6] hover:text-primary"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center">
          <Link href="/dashboard" aria-label="Dashboard">
            <div className="h-8 w-8 rounded-full bg-[#1a2b48] flex items-center justify-center text-white text-xs font-semibold hover:opacity-90 transition">
              JD
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
