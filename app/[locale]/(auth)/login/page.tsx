"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

type AuthMode = "signin" | "forgot" | "recovery";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    let isMounted = true;
    const recoveryInUrl =
      window.location.hash.includes("type=recovery") ||
      window.location.search.includes("type=recovery");

    const initializeAuthState = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (recoveryInUrl) {
        setMode("recovery");
        setMessageType("success");
        setMessage(
          "Enter a new password below to finish resetting your password.",
        );
        return;
      }
      if (session) router.replace("/");
    };

    initializeAuthState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!isMounted) return;
      if (event === "PASSWORD_RECOVERY") {
        setMode("recovery");
        setMessageType("success");
        setMessage(
          "Enter a new password below to finish resetting your password.",
        );
        return;
      }
      if (event === "SIGNED_IN" && !recoveryInUrl) router.replace("/");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const resetFeedback = () => {
    setMessage("");
    setMessageType("");
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetFeedback();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }
    setMessageType("success");
    setMessage("Login successful. Redirecting...");
    router.replace("/");
  };

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetFeedback();
    if (!email.trim()) {
      setMessageType("error");
      setMessage("Please enter your email address first.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }
    setMessageType("success");
    setMessage(
      "Password reset instructions have been sent to your email address.",
    );
  };

  const handleUpdatePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetFeedback();
    if (newPassword.trim().length < 6) {
      setMessageType("error");
      setMessage("Your new password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }
    setMessageType("success");
    setMessage("Your password has been updated.");
    setNewPassword("");
    router.replace("/");
  };

  const isForgotMode = mode === "forgot";
  const isRecoveryMode = mode === "recovery";

  return (
    <div className="flex flex-1 min-h-screen">
      <div className="flex flex-1 items-center justify-center px-8 py-16 sm:px-12 bg-white">
        <div className="w-full max-w-90 flex flex-col">
          <Link href="/" className="flex items-center gap-3 w-fit mb-10">
            <Image
              src="/Daleeli-logo-navy.svg"
              alt="Daleeli Logo"
              width={100}
              height={100}
              className="h-11 w-auto"
              priority
            />
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Daleeli
            </span>
          </Link>

          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-700 mb-3 block">
            {isRecoveryMode
              ? "Secure Access"
              : isForgotMode
                ? "Account Recovery"
                : "Welcome Back"}
          </span>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
            {isRecoveryMode
              ? "Set new password"
              : isForgotMode
                ? "Reset your password"
                : "Sign in to your account"}
          </h1>

          <p className="text-sm text-slate-500 leading-relaxed mb-8">
            {isRecoveryMode
              ? "Choose a strong new password for your Daleeli account."
              : isForgotMode
                ? "Enter your email and we'll send you reset instructions."
                : "Access your professional syndicate services."}
          </p>

          {isRecoveryMode ? (
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  autoComplete="new-password"
                  required
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 h-11"
              >
                {loading ? (
                  "Updating..."
                ) : (
                  <span className="flex items-center gap-2">
                    Update Password <ArrowRight size={15} />
                  </span>
                )}
              </Button>
            </form>
          ) : isForgotMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email">Professional Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 h-11"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <span className="flex items-center gap-2">
                    Send Reset Link <ArrowRight size={15} />
                  </span>
                )}
              </Button>
              <button
                type="button"
                onClick={() => {
                  resetFeedback();
                  setMode("signin");
                }}
                className="w-full text-sm font-semibold text-slate-400 hover:text-slate-700 transition text-center pt-1"
              >
                ← Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
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
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => {
                      resetFeedback();
                      setMode("forgot");
                    }}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 h-11"
              >
                {loading ? (
                  "Authenticating..."
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in <ArrowRight size={15} />
                  </span>
                )}
              </Button>
            </form>
          )}

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

          <div className="mt-8 space-y-4 text-center">
            {!isRecoveryMode && (
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-blue-700 hover:text-blue-800 hover:underline transition-colors"
                >
                  Register here
                </Link>
              </p>
            )}
            <Link
              href="/"
              className="inline-block text-sm font-semibold text-slate-400 hover:text-slate-700 transition"
            >
              Back to Home
            </Link>
          </div>

          <p className="text-xs text-slate-300 text-center mt-12">
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
            Bridging professional excellence with modern accessibility for
            Lebanon's practitioners.
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
