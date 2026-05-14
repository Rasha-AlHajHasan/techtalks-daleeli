import Link from "next/link";
import Image from "next/image";
import {
  Scale,
  ShieldCheck,
  TreePine,
  Stethoscope,
  HardHat,
  Calculator,
  FlaskConical,
  Mail,
  Landmark,
  FileSignature,
  Fingerprint,
} from "lucide-react";
import { useTranslations } from "next-intl";
import FeatureCard from "@/app/components/Cards/FeatureCard";
import PrincipleCard from "@/app/components/Cards/PrincipleCard";
import OrderCard from "@/app/components/Cards/OrderCard";

export default function About() {
  const t = useTranslations("about");

  const principles = [
    {
      icon: Scale,
      title: t("principles.clarity.title"),
      desc: t("principles.clarity.desc"),
    },
    {
      icon: ShieldCheck,
      title: t("principles.reliability.title"),
      desc: t("principles.reliability.desc"),
    },
    {
      icon: TreePine,
      title: t("principles.practicalImpact.title"),
      desc: t("principles.practicalImpact.desc"),
    },
  ];

  const features = [
    {
      icon: Landmark,
      title: t("features.centralized.title"),
      desc: t("features.centralized.desc"),
    },
    {
      icon: FileSignature,
      title: t("features.simpleNavigation.title"),
      desc: t("features.simpleNavigation.desc"),
    },
    {
      icon: Fingerprint,
      title: t("features.userFocused.title"),
      desc: t("features.userFocused.desc"),
    },
  ];

  const orders = [
    { name: t("syndicates.orderNames.beirutBar"), icon: Scale },
    { name: t("syndicates.orderNames.physicians"), icon: Stethoscope },
    { name: t("syndicates.orderNames.engineers"), icon: HardHat },
    { name: t("syndicates.orderNames.accountants"), icon: Calculator },
    { name: t("syndicates.orderNames.tripoliBar"), icon: Scale },
    { name: t("syndicates.orderNames.pharmacists"), icon: FlaskConical },
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

            <p className="text-base text-slate-600 leading-relaxed max-w-lg mb-5">
              {t("hero.paragraph1")}
            </p>

            <p className="text-base text-slate-600 leading-relaxed max-w-lg mb-7">
              {t("hero.paragraph2")}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/syndicates"
                className="bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
              >
                {t("hero.cta")}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative h-105 lg:h-full w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <Image
                src="https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&q=80&w=1200"
                alt="Modern professional environment"
                fill
                className="object-cover object-center"
                priority
              />
            </div>

            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 rounded-xl -z-10"></div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 -mt-10 relative z-20">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FeatureCard
                key={index}
                icon={<Icon size={18} />}
                title={feature.title}
                desc={feature.desc}
              />
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3 block">
            {t("principles.badge")}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {t("principles.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {principles.map((p, i) => (
            <PrincipleCard
              key={i}
              icon={p.icon}
              title={p.title}
              desc={p.desc}
            />
          ))}
        </div>
      </section>

      <section className="bg-white py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700 mb-3 block">
            {t("team.badge")}
          </span>

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">
            {t("team.title")}
          </h2>

          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t("team.description")}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
            {t("syndicates.title")}
          </h2>
          <p className="text-slate-600 text-sm">{t("syndicates.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((o, i) => (
            <OrderCard key={i} icon={o.icon} name={o.name} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 pb-20">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-2">
              {t("contact.title")}
            </h2>
            <p className="text-slate-600 text-sm">{t("contact.subtitle")}</p>
          </div>

          <a
            href={`mailto:${t("contact.email") || "support@daleeli.com"}`}
            className="flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Mail size={18} />
            {t("contact.button")}
          </a>
        </div>
      </section>
    </div>
  );
}
