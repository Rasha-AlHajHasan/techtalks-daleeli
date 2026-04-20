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
import PrincipleCard from "../components/Cards/PrincipleCard";
import FeatureCard from "../components/Cards/FeatureCard";
import OrderCard from "../components/Cards/OrderCard";

const principles = [
  {
    icon: Scale,
    title: "Clarity & Simplicity",
    desc: "Clear and structured information without confusion.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable Information",
    desc: "Accurate and organized data you can trust.",
  },
  {
    icon: TreePine,
    title: "Practical Impact",
    desc: "Useful information for real daily needs.",
  },
];

const features = [
  {
    icon: Landmark,
    title: "Centralized Access",
    desc: "One place for all institutional information.",
  },
  {
    icon: FileSignature,
    title: "Simple Navigation",
    desc: "Easy and intuitive directory structure.",
  },
  {
    icon: Fingerprint,
    title: "User-Focused",
    desc: "Designed entirely around professional needs.",
  },
];

const orders = [
  { name: "Beirut Bar Association", icon: Scale },
  { name: "Order of Physicians", icon: Stethoscope },
  { name: "Order of Engineers & Architects", icon: HardHat },
  { name: "Association of Accountants", icon: Calculator },
  { name: "Tripoli Bar Association", icon: Scale },
  { name: "Order of Pharmacists", icon: FlaskConical },
];

export default function About() {
  return (
    <div className="flex-1 bg-slate-50 text-slate-800">
      <section className="bg-slate-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-12 items-center lg:items-stretch min-h-130">
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-700 mb-6 block">
              About Daleeli
            </span>

            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-slate-900">
              Simplifying Access to{" "}
              <span className="text-blue-700">Syndicate Information</span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-md mb-6">
              Daleeli centralizes Lebanese professional syndicate information
              into one structured platform.
            </p>

            <p className="text-base text-slate-600 leading-relaxed max-w-md mb-8">
              Our mission is to simplify access to regulations, requirements,
              and institutional processes.
            </p>

            <Link
              href="/syndicates"
              className="inline-flex w-fit bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
            >
              Browse Syndicates
            </Link>
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
            What Daleeli Stands For
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Built on Simplicity & Trust
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
            Who We Are
          </span>

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">
            Built by a Driven Team
          </h2>

          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We are a team of passionate developers and designers working
            together as part of the TeckTalks Internship program in Lebanon.
            Through Daleeli, we aim to build a meaningful solution that solves
            real-world regulatory problems while growing our experience in
            creating impactful, modern digital products.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
            Supporting Recognized Orders
          </h2>
          <p className="text-slate-600 text-sm">
            Working to map the requirements of Lebanon's core professional
            bodies.
          </p>
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
              Questions about Daleeli?
            </h2>
            <p className="text-slate-600 text-sm">
              Reach out for support, institutional inquiries, or technical help.
            </p>
          </div>

          <a
            href="mailto:support@daleeli.com"
            className="flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Mail size={18} />
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
