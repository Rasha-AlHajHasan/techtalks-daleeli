import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");

  const navLinks = [
    { href: "/syndicates", label: t("navigation.syndicates") },
    { href: "/news", label: t("navigation.news") },
    {
      href: "/services/contract-review",
      label: t("navigation.contractServices"),
    },
    { href: "/about", label: t("navigation.about") },
  ];

  const institutionalLinks = [
    { href: "#", label: t("institutional.legalTerms") },
    { href: "#", label: t("institutional.privacyPolicy") },
    { href: "#", label: t("institutional.syndicateBylaws") },
  ];

  return (
    <footer className="w-full border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Image
            src="/Daleeli-logo.svg"
            alt={`${tCommon("siteName")} Logo`}
            width={120}
            height={120}
            style={{ width: "120px", height: "auto" }}
          />
          <h1 className="hidden md:block text-2xl font-bold text-blue-400 mt-2">
            {tCommon("siteName")}
          </h1>
          <p className="text-[#75777e] text-sm leading-relaxed max-w-xs">
            {tCommon("tagline")}
          </p>

          <p className="text-slate-400 text-xs mt-5">{tCommon("copyright")}</p>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4">
            {t("navigation.title")}
          </span>

          <div className="flex flex-col gap-2">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-slate-600 hover:text-blue-700 hover:translate-x-0.5 transition-all w-fit"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4">
            {t("institutional.title")}
          </span>

          <div className="flex flex-col gap-2">
            {institutionalLinks.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                className="text-sm text-slate-600 hover:text-blue-700 hover:translate-x-0.5 transition-all w-fit"
              >
                {label}
              </a>
            ))}

            <a
              href={`mailto:${t("institutional.supportEmail")}`}
              className="text-sm text-slate-600 hover:text-blue-700 hover:translate-x-0.5 transition-all w-fit mt-1"
            >
              {t("institutional.supportEmail")}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <span className="text-xs text-slate-400 font-medium">
            {tCommon("institutionalTagline")}
          </span>

          <span className="text-xs text-slate-400">{tCommon("location")}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
