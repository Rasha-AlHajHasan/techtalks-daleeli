import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  GraduationCap,
  Camera,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Search,
  BookOpen,
  FolderSync,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("home");

  const requiredDocs = [
    {
      Icon: FileText,
      label: t("requiredDocs.civilStatus.label"),
      sub: t("requiredDocs.civilStatus.sub"),
    },
    {
      Icon: GraduationCap,
      label: t("requiredDocs.educationalCerts.label"),
      sub: t("requiredDocs.educationalCerts.sub"),
    },
    {
      Icon: Camera,
      label: t("requiredDocs.passportPhotos.label"),
      sub: t("requiredDocs.passportPhotos.sub"),
    },
    {
      Icon: ShieldCheck,
      label: t("requiredDocs.judicialRecord.label"),
      sub: t("requiredDocs.judicialRecord.sub"),
    },
  ];

  const eligibility = [
    t("eligibility.criteria1"),
    t("eligibility.criteria2"),
    t("eligibility.criteria3"),
  ];

  const steps = [
    {
      icon: Search,
      title: t("steps.findSyndicate.title"),
      desc: t("steps.findSyndicate.desc"),
    },
    {
      icon: BookOpen,
      title: t("steps.reviewRequirements.title"),
      desc: t("steps.reviewRequirements.desc"),
    },
    {
      icon: FolderSync,
      title: t("steps.prepareFile.title"),
      desc: t("steps.prepareFile.desc"),
    },
  ];

  return (
    <div className="flex-1 bg-slate-50 text-slate-800">
      <section className="bg-slate-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-12 items-center lg:items-stretch min-h-130">
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-700 mb-6 block">
              {t("hero.badge")}
            </span>

            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-slate-900">
              {t("hero.title")}{" "}
              <span className="text-blue-700">{t("hero.titleHighlight")}</span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-md mb-8">
              {t("hero.description")}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/syndicates"
                className="bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-800 transition flex items-center gap-2"
              >
                {t("hero.ctaPrimary")} <ArrowRight size={16} />
              </Link>

              <Link
                href="/about"
                className="bg-slate-100 text-slate-900 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-slate-200 transition"
              >
                {t("hero.ctaSecondary")}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative h-105 lg:h-full w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <Image
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200"
                alt="Professional documents signing"
                fill
                className="object-cover object-center"
                priority
              />
            </div>

            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 rounded-xl -z-10"></div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3 block">
            {t("steps.badge")}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {t("steps.title")}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm hover:border-blue-300 transition-colors"
              >
                <div className="h-12 w-12 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center mb-6">
                  <Icon size={24} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Global Requirements */}
      <section className="bg-white border-y border-slate-200 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 shrink-0">
              {t("requiredDocs.title")}
            </h2>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {requiredDocs.map(({ Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-start gap-4 bg-slate-50 border border-slate-100 rounded-lg p-5 hover:border-blue-200 hover:bg-white transition-colors shadow-sm"
              >
                <div className="mt-0.5 shrink-0 text-blue-700">
                  <Icon size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500 mt-1">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="bg-slate-100">
        <div className="max-w-7xl mx-auto px-8 py-20 grid md:grid-cols-5 gap-12 lg:gap-20 items-start">
          <div className="md:col-span-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 block">
              {t("eligibility.title")}
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-8">
              {t("eligibility.subtitle")}
            </h2>
            <ul className="space-y-5">
              {eligibility.map((text, i) => (
                <li key={i} className="flex items-start gap-4">
                  <CheckCircle2
                    size={20}
                    strokeWidth={2}
                    className="text-blue-700 shrink-0 mt-0.5"
                  />
                  <p className="text-base text-slate-600 leading-relaxed">
                    {text}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700 mb-3 block">
              {t("eligibility.notice.title")}
            </span>
            <p className="text-sm text-slate-600 leading-relaxed mb-8">
              {t("eligibility.notice.description")}
            </p>
            <Link
              href="/register"
              className="flex items-center justify-between bg-blue-700 text-white text-sm font-semibold px-5 py-3.5 rounded-lg hover:bg-blue-800 transition-colors w-full shadow-sm"
            >
              {t("eligibility.notice.cta")}{" "}
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
