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
    <footer className="w-full border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-3 mb-6 w-fit">
            <Image
              src="/Daleeli-logo-navy.svg"
              alt={`${tCommon("siteName")} Logo`}
              width={0}
              height={0}
              sizes="100vw"
              className="h-10 md:h-12 w-auto object-contain"
            />
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              {tCommon("siteName")}
            </span>
          </Link>
          <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-sm mb-8">
            {tCommon("tagline")}
          </p>
          <p className="text-xs font-medium text-slate-400">
            {tCommon("copyright")}
          </p>
        </div>

        <div>
          <span className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-900 mb-6">
            {t("navigation.title")}
          </span>
          <div className="flex flex-col gap-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="w-fit text-sm font-medium text-slate-600 transition-colors hover:text-blue-700"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-900 mb-6">
            {t("institutional.title")}
          </span>
          <div className="flex flex-col gap-3">
            {institutionalLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="w-fit text-sm font-medium text-slate-600 transition-colors hover:text-blue-700"
              >
                {label}
              </Link>
            ))}
            <a
              href={`mailto:${t("institutional.supportEmail")}`}
              className="mt-2 w-fit text-sm font-medium text-slate-600 transition-colors hover:text-blue-700"
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

      <div className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row lg:px-8">
          <span className="text-xs font-semibold text-slate-500">
            {tCommon("institutionalTagline")}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {tCommon("location")}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;