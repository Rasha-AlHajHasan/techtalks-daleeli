"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/app/utils/supabase/client";

const navLinks = [
  { href: "/syndicates", label: "Syndicates" },
  { href: "/news", label: "News" },
  { href: "/services/contract-review", label: "Services" },
  { href: "/about", label: "About" },
];

type AuthUser = {
  email: string | null;
  fullName: string | null;
  initials: string;
};

const getInitials = (fullName: string | null, email: string | null) => {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  }

  return email?.[0]?.toUpperCase() ?? "";
};

const Header = () => {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const fullName = profile?.full_name ?? null;

      setAuthUser({
        email: user.email ?? null,
        fullName,
        initials: getInitials(fullName, user.email ?? null),
      });
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setAuthUser(null);
        setOpen(false);
        return;
      }

      void loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setOpen(false);
  };

  const displayName = authUser?.fullName || authUser?.email;

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[#e6e8ea] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 sm:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/daleeli_logo_transparent.png"
              alt="Daleeli Logo"
              width={80}
              height={10}
              style={{ marginRight: "30px", height: "auto" }}
            />
          </Link>

          <div className="ml-2 hidden items-center gap-1 md:flex">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {authUser ? (
            <div className="relative" ref={menuRef}>
              <div className="flex items-center gap-3">
                <span className="hidden text-sm font-semibold text-slate-700 sm:inline">
                  {displayName}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen((current) => !current)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-[#1a2b48] text-sm font-semibold text-white transition hover:bg-[#142238]"
                  aria-label="Toggle account menu"
                  aria-expanded={open}
                >
                  {authUser.initials ? (
                    authUser.initials
                  ) : (
                    <UserCircle size={18} />
                  )}
                </button>
              </div>

              {open && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl border border-[#c5c6ce]/30 bg-white py-2 shadow-lg">
                  <div className="border-b border-slate-100 px-4 pb-3 pt-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {displayName}
                    </p>
                    {authUser.email && (
                      <p className="mt-1 text-xs text-slate-500">
                        {authUser.email}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 block w-full px-4 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
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
