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
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between h-14 max-w-7xl mx-auto px-8">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-slate-900 hover:text-blue-700 transition"
          >
            Daleeli
          </Link>

          <div className="hidden md:flex items-center ml-10 gap-1">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    isActive
                      ? "text-blue-700 bg-blue-50"
                      : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User */}
        <div className="flex items-center">
          <Link href="/dashboard" aria-label="Dashboard">
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition">
              JD
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
