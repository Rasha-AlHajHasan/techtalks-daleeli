"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Bell } from "lucide-react";
import { useTranslations } from "next-intl";

type Syndicate = {
  id: string;
  name: string;
  slug: string;
};

export default function RegisterPage() {
  const t = useTranslations("authPages.register");
  const tShared = useTranslations("authPages.shared");
  const tCommon = useTranslations("common");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [syndicateId, setSyndicateId] = useState("");
  const [memberNumber, setMemberNumber] = useState("");
  const [subscribeToNews, setSubscribeToNews] = useState(true);
  const [syndicates, setSyndicates] = useState<Syndicate[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const router = useRouter();

  useEffect(() => {
    const fetchSyndicates = async () => {
      const { data, error } = await supabase
        .from("syndicates")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        setMessageType("error");
        setMessage(t("messages.syndicatesLoadError", { error: error.message }));
        return;
      }
      setSyndicates(data || []);
    };
    fetchSyndicates();
  }, [t]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!fullName.trim()) {
      setMessageType("error");
      setMessage(t("messages.fullNameRequired"));
      return;
    }
    if (!syndicateId) {
      setMessageType("error");
      setMessage(t("messages.syndicateRequired"));
      return;
    }
    if (!/^[0-9]{6,}$/.test(memberNumber)) {
      setMessageType("error");
      setMessage(t("messages.memberNumberInvalid"));
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          syndicate_id: syndicateId,
          syndicate_member_number: memberNumber,
          subscribe_to_news: subscribeToNews,
        },
      },
    });
    setLoading(false);

    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }
    if (!data.session) {
      setMessageType("error");
      setMessage(t("messages.emailConfirmationEnabled"));
      return;
    }

    if (subscribeToNews) {
      const token = data.session.access_token;
      const res = await fetch("/api/news/subscriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          syndicate_id: syndicateId,
          subscribe_to_news: true,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setMessageType("error");
        setMessage(
          body?.error ??
            t("messages.subscriptionSaveError"),
        );
        return;
      }
    }

    setMessageType("success");
    setMessage(t("messages.welcome"));
    router.push("/profile");
    router.refresh();
  };

  return (
    <div className="flex h-dvh min-h-0 flex-1 overflow-hidden">
      <div className="flex min-h-0 flex-1 items-center justify-center bg-white px-6 py-4 sm:px-10">
        <div className="flex w-full max-w-xl flex-col">
          <Link href="/" className="mb-4 flex w-fit items-center gap-3">
            <Image
              src="/Daleeli-logo-navy.svg"
              alt={tShared("logoAlt")}
              width={100}
              height={100}
              className="h-9 w-auto"
              priority
            />
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              {tCommon("siteName")}
            </span>
          </Link>

          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-blue-700">
            {t("eyebrow")}
          </span>

          <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-slate-900">
            {t("title")}
          </h1>

          <p className="mb-3 text-sm leading-relaxed text-slate-500">
            {t("description")}
          </p>

          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="full-name">
                  {t("fields.fullName.label")}
                </Label>
                <Input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("fields.fullName.placeholder")}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">{t("fields.email.label")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t("fields.phone.label")}</Label>
                <Input
                  id="phone"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t("fields.phone.placeholder")}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="member-number">
                  {t("fields.memberNumber.label")}
                </Label>
                <Input
                  id="member-number"
                  type="text"
                  value={memberNumber}
                  onChange={(e) => setMemberNumber(e.target.value)}
                  placeholder={t("fields.memberNumber.placeholder")}
                  required
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="password">
                  {t("fields.password.label")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="syndicate">
                  {t("fields.syndicate.label")}
                </Label>
                <Select
                  value={syndicateId}
                  onValueChange={setSyndicateId}
                  required
                >
                  <SelectTrigger id="syndicate" className="h-10 w-full">
                    <SelectValue
                      placeholder={t("fields.syndicate.placeholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {syndicates.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <label
              htmlFor="subscribe-news"
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >
              <input
                id="subscribe-news"
                type="checkbox"
                checked={subscribeToNews}
                onChange={(e) => setSubscribeToNews(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-700 accent-blue-700"
              />
              <span className="flex min-w-0 flex-1 gap-2">
                <Bell className="mt-0.5 size-4 shrink-0 text-blue-700" />
                <span>
                  <span className="block text-sm font-bold text-slate-900">
                    {t("subscribe.title")}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-600">
                    {t("subscribe.description")}
                  </span>
                </span>
              </span>
            </label>

            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full bg-blue-700 hover:bg-blue-800"
            >
              {loading ? (
                t("actions.creating")
              ) : (
                <span className="flex items-center gap-2">
                  {t("actions.create")} <ArrowRight size={15} />
                </span>
              )}
            </Button>
          </form>

          {message && (
            <div
              className={`mt-5 rounded-lg border px-4 py-3 text-sm font-medium ${
                messageType === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-4 space-y-1 text-center">
            <p className="text-sm text-slate-500">
              {t("links.hasAccount")}{" "}
              <Link
                href="/login"
                className="font-bold text-blue-700 hover:text-blue-800 hover:underline transition-colors"
              >
                {t("links.signin")}
              </Link>
            </p>
            <Link
              href="/"
              className="inline-block text-sm font-semibold text-slate-400 hover:text-slate-700 transition"
            >
              {tShared("backHome")}
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-slate-300">
            {tShared("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>

      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%]">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
          alt={tShared("imageAlt")}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-br from-slate-900/60 via-slate-900/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md mb-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              {tShared("panel.badge")}
            </span>
          </div>
          <p className="text-xl font-semibold leading-snug text-white max-w-sm">
            {t("panel.description")}
          </p>
          <div className="mt-8 flex items-center gap-8">
            {[
              [tShared("stats.syndicates.value"), tShared("stats.syndicates.label")],
              [tShared("stats.languages.value"), tShared("stats.languages.label")],
              [tShared("stats.access.value"), tShared("stats.access.label")],
            ].map(([num, label]) => (
              <div key={label}>
                <p className="text-2xl font-extrabold text-white">{num}</p>
                <p className="text-xs text-white/60 font-medium mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
