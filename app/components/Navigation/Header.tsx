"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { usePathname, useRouter } from "next/navigation";
import { UserCircle, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { supabase } from "@/app/lib/supabase/browser";
import { useLocale, useTranslations } from "next-intl";
import LanguageSwitcher from "../LanguageSwitcher";
import { Button } from "@/components/ui/button";

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
  const router = useRouter();
  const [, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const t = useTranslations("header");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const navLinks = [
    { href: "/syndicates", label: t("navLinks.syndicates") },
    { href: "/news", label: t("navLinks.news") },
    { href: "/services", label: t("navLinks.services") },
    { href: "/about", label: t("navLinks.about") },
  ];

  useEffect(() => {
    startTransition(() => {
      setMobileMenuOpen(false);
    });
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (!user) {
          setAuthUser(null);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (cancelled) return;

        const fullName = profile?.full_name ?? null;

        setAuthUser({
          email: user.email ?? null,
          fullName,
          initials: getInitials(fullName, user.email ?? null),
        });
      } catch (err: unknown) {
        if (
          cancelled ||
          (err instanceof Error && err.name === "AbortError")
        ) {
          return;
        }
        console.error("Failed to load user:", err);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string) => {
      if (cancelled) return;
      if (event === "SIGNED_OUT") {
        setAuthUser(null);
        setOpen(false);
        setMobileMenuOpen(false);
        return;
      }
      void loadUser();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

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
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const displayName = authUser?.fullName || authUser?.email;

  return (
    <>
      <nav className="fixed top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-8 lg:gap-12">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/Daleeli-logo-navy.svg"
                alt={`${tCommon("siteName")} Logo`}
                width={100}
                height={100}
                className="h-12 w-auto"
                priority
              />
              <span className="hidden md:block text-2xl font-extrabold tracking-tight text-slate-900">
                {tCommon("siteName")}
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map(({ href, label }) => {
                const isActive = pathname === href || pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <div className="hidden lg:block">
              {authUser ? (
                <div className="relative" ref={menuRef}>
                  <div
                    className={`flex items-center gap-3 ${
                      isRtl ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span className="text-sm font-bold text-slate-700">
                      {displayName}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setOpen((current) => !current)}
                      className="rounded-full h-10 w-10 border-slate-200 bg-slate-50 text-blue-700 hover:bg-blue-50 hover:border-blue-200 shadow-sm"
                    >
                      {authUser.initials ? (
                        authUser.initials
                      ) : (
                        <UserCircle className="size-5 text-slate-500" />
                      )}
                    </Button>
                  </div>

                  {open && (
                    <div
                      className={`absolute mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-2 shadow-lg ${
                        isRtl
                          ? "left-0 text-right"
                          : "right-0 text-left"
                      }`}
                      dir={isRtl ? "rtl" : "ltr"}
                    >
                      <div className="border-b border-slate-100 px-3 pb-3 pt-2 mb-2">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {displayName}
                        </p>
                        {authUser.email && (
                          <p className="mt-1 text-xs text-slate-500 truncate">
                            {authUser.email}
                          </p>
                        )}
                      </div>
                      <Button
                        asChild
                        variant="ghost"
                        className={`w-full ${isRtl ? "justify-end" : ""}`}
                      >
                        <Link href="/profile" onClick={() => setOpen(false)}>
                          {t("auth.profile")}
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className={`w-full ${isRtl ? "justify-end" : ""}`}
                      >
                        {t("auth.signOut")}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button asChild variant="outline" className="px-5">
                    <Link href="/login">{t("auth.login")}</Link>
                  </Button>
                  <Button asChild className="px-5">
                    <Link href="/register">{t("auth.register")}</Link>
                  </Button>
                </div>
              )}
            </div>

            <div onClick={() => setMobileMenuOpen(true)} className="lg:hidden">
              <Menu className="size-5" />
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-100 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-110 w-[85vw] max-w-[320px] bg-white shadow-2xl flex flex-col h-full overflow-y-auto border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              {tCommon("siteName")}
            </span>
          </Link>
          <div onClick={() => setMobileMenuOpen(false)}>
            <X className="size-5" />
          </div>
        </div>

        <div className="flex flex-col py-4 flex-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`block px-6 py-3.5 text-base font-semibold transition-all ${
                  isActive
                    ? "border-l-4 border-blue-700 bg-blue-50/50 text-blue-700"
                    : "border-l-4 border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 p-6 flex flex-col gap-4">
          <div className="sm:hidden w-full [&_button]:w-full [&_button]:h-11 [&_button]:justify-between">
            <LanguageSwitcher />
          </div>

          {authUser ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm mb-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 border border-blue-100">
                  {authUser.initials || (
                    <UserCircle className="size-5 text-slate-500" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {displayName}
                  </p>
                  {authUser.email && (
                    <p className="text-xs font-medium text-slate-500 truncate">
                      {authUser.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline" className="h-9">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("auth.profile")}
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  className="h-9"
                  onClick={handleLogout}
                >
                  {t("auth.signOut")}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Button asChild variant="outline" className="w-full h-9">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  {t("auth.login")}
                </Link>
              </Button>
              <Button asChild className="w-full h-9">
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  {t("auth.register")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
