"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const navLinks = [
  { href: "/syndicates", label: "Syndicates" },
  { href: "/news", label: "News" },
  { href: "/services/contract-review", label: "Services" },
  { href: "/about", label: "About" },
];

const Header = () => {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // fetch profile info
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        setUserName(profile?.full_name || user.email);
      }
    }
    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserName(null);
  }

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
        <div className="flex items-center gap-3">
          {userName ? (
            <>
              <span className="text-sm font-semibold text-slate-700">
                {userName}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-[#d9dde3] px-3 py-1 text-sm text-[#344054] hover:bg-[#f8fafc]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
