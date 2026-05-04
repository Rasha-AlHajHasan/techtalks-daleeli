"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

type Syndicate = {
  id: string;
  name: string;
  slug: string;
};

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [syndicateId, setSyndicateId] = useState("");
  const [memberNumber, setMemberNumber] = useState("");
  const [syndicates, setSyndicates] = useState<Syndicate[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const router = useRouter();

  useEffect(() => {
    const fetchSyndicates = async () => {
      const { data, error } = await supabase
        .from("syndicates")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        setMessageType("error");
        setMessage(`Failed to load syndicates: ${error.message}`);
        return;
      }
      setSyndicates(data || []);
    };
    fetchSyndicates();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!fullName.trim()) {
      setMessageType("error");
      setMessage("Full name is required.");
      return;
    }
    if (!syndicateId) {
      setMessageType("error");
      setMessage("Please select a syndicate.");
      return;
    }
    if (!/^[0-9]{6,}$/.test(memberNumber)) {
      setMessageType("error");
      setMessage("Syndicate member number must be at least 6 digits.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          syndicate_id: syndicateId,
          syndicate_member_number: memberNumber,
        },
      },
    });
    setLoading(false);

    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }
    if (!data.session) {
      setMessageType("error");
      setMessage(
        "Email confirmation is still enabled. Disable it in Supabase.",
      );
      return;
    }

    setMessageType("success");
    setMessage("Welcome to Daleeli!");
    router.push("/profile");
    router.refresh();
  };

  return (
    <div className="flex h-dvh min-h-0 flex-1 overflow-hidden">
      <div className="flex min-h-0 flex-1 items-center justify-center bg-white px-6 py-4 sm:px-10">
        <div className="flex w-full max-w-xl flex-col">
          <Link href="/" className="mb-4 flex w-fit items-center gap-3">
            <Image
              src="/Daleeli-logo-navy.svg"
              alt="Daleeli Logo"
              width={100}
              height={100}
              className="h-9 w-auto"
              priority
            />
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Daleeli
            </span>
          </Link>

          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-blue-700">
            Get Started
          </span>

          <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-slate-900">
            Create your account
          </h1>

          <p className="mb-3 text-sm leading-relaxed text-slate-500">
            Register with your official syndicate information to access services
            and guidance.
          </p>

          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Professional Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+961 ..."
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="member-number">Syndicate No.</Label>
                <Input
                  id="member-number"
                  type="text"
                  value={memberNumber}
                  onChange={(e) => setMemberNumber(e.target.value)}
                  placeholder="Min. 6 digits"
                  required
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="syndicate">Syndicate</Label>
                <Select
                  value={syndicateId}
                  onValueChange={setSyndicateId}
                  required
                >
                  <SelectTrigger id="syndicate" className="h-10 w-full">
                    <SelectValue placeholder="Select a syndicate" />
                  </SelectTrigger>
                  <SelectContent>
                    {syndicates.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full bg-blue-700 hover:bg-blue-800"
            >
              {loading ? (
                "Creating account..."
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight size={15} />
                </span>
              )}
            </Button>
          </form>

          {message && (
            <div
              className={`mt-5 rounded-lg border px-4 py-3 text-sm font-medium ${
                messageType === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-4 space-y-1 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-blue-700 hover:text-blue-800 hover:underline transition-colors"
              >
                Sign in here
              </Link>
            </p>
            <Link
              href="/"
              className="inline-block text-sm font-semibold text-slate-400 hover:text-slate-700 transition"
            >
              Back to Home
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-slate-300">
            © {new Date().getFullYear()} Daleeli · Lebanese Professional
            Syndicates Portal
          </p>
        </div>
      </div>

      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%]">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
          alt="Modern corporate environment"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-br from-slate-900/60 via-slate-900/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md mb-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              Daleeli Portal
            </span>
          </div>
          <p className="text-xl font-semibold leading-snug text-white max-w-sm">
            Join Lebanon&apos;s professional community — one unified platform for all
            syndicates.
          </p>
          <div className="mt-8 flex items-center gap-8">
            {[
              ["6", "Syndicates"],
              ["3", "Languages"],
              ["Free", "Access"],
            ].map(([num, label]) => (
              <div key={label}>
                <p className="text-2xl font-extrabold text-white">{num}</p>
                <p className="text-xs text-white/60 font-medium mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
