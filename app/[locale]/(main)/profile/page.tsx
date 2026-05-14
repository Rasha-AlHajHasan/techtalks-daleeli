"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/browser";
import { useLocale, useTranslations } from "next-intl";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  syndicate_member_number: string;
  created_at: string;
  syndicates: {
    name: string;
    slug: string;
  }[] | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          email,
          syndicate_member_number,
          created_at,
          syndicates (
            name,
            slug
          )
        `,
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setProfile(data as Profile);
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const formatDate = (date: string) => {
    const dateLocale =
      locale === "ar" ? "ar-LB" : locale === "fr" ? "fr-FR" : "en-US";

    return new Date(date).toLocaleDateString(dateLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const initials =
    profile?.full_name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0]?.toUpperCase())
      .join("") || "U";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f8fb] pt-24">
        <section className="mx-auto max-w-6xl px-6 py-10">
          <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="h-6 w-40 rounded bg-slate-200" />
            <div className="mt-6 h-32 rounded-2xl bg-slate-100" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="h-28 rounded-2xl bg-slate-100" />
              <div className="h-28 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (message) {
    return (
      <main className="min-h-screen bg-[#f6f8fb] pt-24">
        <section className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {message}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] pt-24">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#1a2b48]/60">
              {t("hero.badge")}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
              {t("hero.title")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {t("hero.description")}
            </p>
          </div>

          <Link
            href="/syndicates"
            className="inline-flex w-fit items-center rounded-xl bg-[#1a2b48] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#142238]"
          >
            {t("hero.cta")}
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
          <aside className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="bg-white p-8 text-black border-b border-slate-200">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-slate-100 text-2xl font-bold shadow-inner">
                {initials}
              </div>

              <h2 className="mt-6 text-2xl font-bold text-black">
                {profile?.full_name || t("fallback.user")}
              </h2>

              <p className="mt-2 break-all text-sm text-slate-600">
                {profile?.email}
              </p>

              <div className="mt-6 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {t("status.activeAccount")}
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("labels.memberNumber")}
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {profile?.syndicate_member_number || "-"}
                </p>
              </div>

              <div className="h-px bg-slate-100" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("labels.accountCreated")}
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {profile?.created_at ? formatDate(profile.created_at) : "-"}
                </p>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    {t("sections.syndicateConnection")}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-950">
                    {profile?.syndicates?.[0]?.name ||
                      t("fallback.notAssigned")}
                  </h3>
                </div>

                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {t("status.verifiedLink")}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoCard
                  label={t("labels.syndicate")}
                  value={
                    profile?.syndicates?.[0]?.name ||
                    t("fallback.notAssigned")
                  }
                />
                <InfoCard
                  label={t("labels.syndicateSlug")}
                  value={profile?.syndicates?.[0]?.slug || "-"}
                />
                <InfoCard
                  label={t("labels.governmentNumber")}
                  value={profile?.syndicate_member_number || "-"}
                />
                <InfoCard
                  label={t("labels.accountStatus")}
                  value={t("status.active")}
                  valueClassName="text-emerald-700"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                {t("sections.accountInformation")}
              </p>

              <div className="mt-5 space-y-4">
                <DetailRow
                  label={t("labels.fullName")}
                  value={profile?.full_name || "-"}
                />
                <DetailRow
                  label={t("labels.emailAddress")}
                  value={profile?.email || "-"}
                />
                <DetailRow
                  label={t("labels.createdAt")}
                  value={
                    profile?.created_at ? formatDate(profile.created_at) : "-"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  label,
  value,
  valueClassName = "text-slate-950",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className={`mt-3 break-words text-lg font-bold ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="break-all text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
