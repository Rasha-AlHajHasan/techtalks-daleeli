"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { UserCircle } from "lucide-react";
import { createClient } from "@/app/Utils/supabase/client";

const navLinks = [
  { href: "/syndicates", label: "Syndicates" },
  { href: "/news", label: "News" },
  { href: "/services/contract-review", label: "Services" },
  { href: "/about", label: "About" },
];

const Header = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

if(user) {
  setUser({ firstName: user.user_metadata?.first_name||"", lastName: user.user_metadata?.last_name||"" });
 }
} ;

getUser();
},[]);
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#e6e8ea]">
      <div className="relative">
  <button onClick={() => setOpen(!open)} className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
    {user?.firstName?.[0]}{user?.lastName?.[0]}
  </button>

  {open && (
    <div className="absolute right-0 mt-2 w-48 bg-white border border-[#c5c6ce]/30 rounded-xl shadow-lg py-2 z-50">
      <a href="/profile" className="block px-4 py-2 text-sm text-[#44474d] hover:bg-gray-50">Profile</a>
      <a href="/settings" className="block px-4 py-2 text-sm text-[#44474d] hover:bg-gray-50">Settings</a>
      <hr className="my-1 border-[#c5c6ce]/30" />
      <button className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50">Sign out</button>
    </div>
  )}
</div>
      <div className="flex items-center justify-between h-14 max-w-7xl mx-auto px-8">
        <div className="flex items-center">
          <Image
            src="/daleeli_logo_transparent.png"
            alt="Daleeli Logo"
            width={80}
            height={10}
            style={{marginRight: "30px",height:"auto"}}
          />
        
          <div className="hidden md:flex items-center ml-10 gap-6">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    isActive
                      ? "bg-[#1a2b48] text-white"
                      : "text-[#44474d] hover:bg-[#f2f4f6] hover:text-primary"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center">
          <Link href="/dashboard" aria-label="Dashboard">
            <div className="h-8 w-8 rounded-full bg-[#1a2b48] flex items-center justify-center text-white text-xs font-semibold hover:opacity-90 transition">
              JD
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
