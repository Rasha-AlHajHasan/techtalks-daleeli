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
    <nav className="fixed top-0 z-50 w-full border-b border-[#e6e8ea] bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-[#1a2b48] transition hover:opacity-80"
          >
            Daleeli
          </Link>

          <div className="ml-10 hidden items-center gap-3 md:flex">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#1a2b48] text-white"
                      : "text-[#44474d] hover:bg-[#f2f4f6] hover:text-[#1a2b48]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg border border-[#d9dde3] px-4 py-2 text-sm font-semibold text-[#344054] transition hover:bg-[#f8fafc]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-[#1a2b48] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#142238]"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;