"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";

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

    const { error } = await supabase.auth.signUp({
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

    setMessageType("success");
    setMessage(
      "Registration successful. Check your email if confirmation is enabled.",
    );

    setFullName("");
    setPhoneNumber("");
    setEmail("");
    setPassword("");
    setSyndicateId("");
    setMemberNumber("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-24">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-between bg-[#17263f] px-6 py-8 text-white sm:px-8 lg:px-10">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100">
                Daleeli
              </div>

              <h1 className="mt-5 max-w-md text-2xl font-bold leading-tight sm:text-3xl">
                Create your account and connect to your syndicate
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Register with your official syndicate information to access
                guidance, updates, and services in one secure place.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold">Required information</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Full name, email, selected syndicate, and your
                  government-issued syndicate number.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold">Already registered?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Sign in to continue from your existing account.
                </p>
                <Link
                  href="/login"
                  className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#17263f] transition hover:bg-slate-200"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Register
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Create your account
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Fill in your information below to create your Daleeli account.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2b48] focus:ring-2 focus:ring-slate-200"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2b48] focus:ring-2 focus:ring-slate-200"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Government Syndicate Number
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2b48] focus:ring-2 focus:ring-slate-200"
                    type="text"
                    value={memberNumber}
                    onChange={(e) => setMemberNumber(e.target.value)}
                    required
                    placeholder="Minimum 6 digits"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2b48] focus:ring-2 focus:ring-slate-200"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2b48] focus:ring-2 focus:ring-slate-200"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Syndicate
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2b48] focus:ring-2 focus:ring-slate-200"
                    value={syndicateId}
                    onChange={(e) => setSyndicateId(e.target.value)}
                    required
                  >
                    <option value="">Select a syndicate</option>
                    {syndicates.map((syndicate) => (
                      <option key={syndicate.id} value={syndicate.id}>
                        {syndicate.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1a2b48] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#142238] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Registering..." : "Create Account"}
              </button>
            </form>

            {message && (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                  messageType === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <p className="mt-5 text-center text-sm text-slate-600">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#1a2b48] hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
