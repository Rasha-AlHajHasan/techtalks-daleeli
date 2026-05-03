import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");

  const navLinks = [
    { href: "/syndicates", label: t("navigation.syndicates") },
    { href: "/news", label: t("navigation.news") },
    { href: "/services/contract-review", label: t("navigation.contractServices") },
    { href: "/about", label: t("navigation.about") },
  ];

  const institutionalLinks = [
    { href: "#", label: t("institutional.legalTerms") },
    { href: "#", label: t("institutional.privacyPolicy") },
    { href: "#", label: t("institutional.syndicateBylaws") },
  ];

  return (
    <footer className="w-full bg-white border-t border-slate-100 mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">

        {/* Brand Column */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
           <Image
  src="/Daleeli-logo-navy.svg"
  alt={`${tCommon("siteName")} Logo`}
  width={80}
  height={80}
  style={{ width: "80px", height: "auto" }}
/>
            <span className="text-xl font-bold text-[#0048ff]">
              {tCommon("siteName")}
            </span>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
            {tCommon("tagline")}
          </p>

          {/* Divider */}
          <div className="w-10 h-px bg-[#0048ff] opacity-30 mt-1" />

          <p className="text-slate-400 text-xs">{tCommon("copyright")}</p>
        </div>

        {/* Spacer */}
        <div className="hidden md:block md:col-span-2" />

        {/* Navigation Column */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {t("navigation.title")}
          </span>
          <div className="flex flex-col gap-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-slate-500 hover:text-[#0048ff] hover:translate-x-0.5 transition-all duration-200 w-fit"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Institutional Column */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {t("institutional.title")}
          </span>
          <div className="flex flex-col gap-3">
            {institutionalLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-sm text-slate-500 hover:text-[#0048ff] hover:translate-x-0.5 transition-all duration-200 w-fit"
              >
                {label}
              </Link>
            ))}

            {/* ✅ Fixed: <a> tag was missing */}
            <a
              href={`mailto:${t("institutional.supportEmail")}`}
              className="text-sm text-slate-500 hover:text-[#0048ff] transition-colors duration-200 w-fit mt-1 flex items-center gap-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5 opacity-60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              {t("institutional.supportEmail")}
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <span className="text-xs text-slate-400 font-medium">
            {tCommon("institutionalTagline")}
          </span>
          <span className="text-xs text-slate-400">
            {tCommon("location")}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;