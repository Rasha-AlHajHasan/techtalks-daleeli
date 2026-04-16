import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full border-t border-[#c5c6ce]/20 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <span className="font-display font-bold text-primary text-base block mb-3 tracking-tight">
            Daleeli
          </span>
          <p className="text-[#75777e] text-sm leading-relaxed max-w-xs">
            A digital ecosystem bridging professional excellence and modern
            accessibility. Registered syndicate portal for the Lebanese Bar
            Association.
          </p>
          <p className="text-[#a0a3a8] text-xs mt-5">
            © 2026 Daleeli. All rights reserved.
          </p>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#a0a3a8] block mb-4">
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
                className="text-sm text-[#44474d] hover:text-primary transition-colors w-fit"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#a0a3a8] block mb-4">
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
                className="text-sm text-[#44474d] hover:text-primary transition-colors w-fit"
              >
                {label}
              </a>
            ))}
            <a
              href="mailto:support@modernlegist.gov.lb"
              className="text-sm text-[#44474d] hover:text-primary transition-colors w-fit mt-1"
            >
              support@modernlegist.gov.lb
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#c5c6ce]/20 px-8 py-4 max-w-7xl mx-auto flex items-center justify-between">
        <span className="text-xs text-[#a0a3a8]">
          Lebanese Bar Association · Official Portal
        </span>
        <span className="text-xs text-[#a0a3a8]">Beirut, Lebanon</span>
      </div>
    </footer>
  );
};

export default Footer;
