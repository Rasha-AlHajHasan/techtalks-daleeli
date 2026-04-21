import Link from "next/link";
import Image from "next/image";
const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Image src="/daleeli_logo_transparent.png" alt="Daleeli Logo" width={120} height={120} style={{margin: "0 70px", height:"auto"}} />
          <p className="text-[#75777e] text-sm leading-relaxed max-w-xs">
            A digital ecosystem bridging professional excellence and modern
            accessibility. Registered syndicate portal for the Lebanese Bar
            Association.
          </p>

          <p className="text-slate-400 text-xs mt-5">
            © 2026 Daleeli. All rights reserved.
          </p>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4">
            Navigation
          </span>

          <div className="flex flex-col gap-2">
            {[
              { href: "/syndicates", label: "Syndicates" },
              { href: "/news", label: "News & Updates" },
              { href: "/services/contract-review", label: "Contract Services" },
              { href: "/about", label: "About" },
            ].map(({ href, label }) => (
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
            Institutional
          </span>

          <div className="flex flex-col gap-2">
            {[
              { href: "#", label: "Legal Terms" },
              { href: "#", label: "Privacy Policy" },
              { href: "#", label: "Syndicate Bylaws" },
            ].map(({ href, label }) => (
              <a
                key={label}
                href={href}
                className="text-sm text-slate-600 hover:text-blue-700 hover:translate-x-0.5 transition-all w-fit"
              >
                {label}
              </a>
            ))}

            <a
              href="mailto:support@daleeli.com"
              className="text-sm text-slate-600 hover:text-blue-700 hover:translate-x-0.5 transition-all w-fit mt-1"
            >
              support@daleeli.com
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <span className="text-xs text-slate-400 font-medium">
            Lebanese Professional Syndicate Portal
          </span>

          <span className="text-xs text-slate-400">Beirut, Lebanon</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
