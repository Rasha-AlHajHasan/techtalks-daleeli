"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  FileText, Upload, ChevronDown, CheckCircle2,
  AlertCircle, Loader2, Globe, X, FileCheck,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase/browser";

// ─── Countries ────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "LB", name: "Lebanon",       flag: "🇱🇧" },
  { code: "SA", name: "Saudi Arabia",  flag: "🇸🇦" },
  { code: "AE", name: "UAE",           flag: "🇦🇪" },
  { code: "EG", name: "Egypt",         flag: "🇪🇬" },
  { code: "JO", name: "Jordan",        flag: "🇯🇴" },
  { code: "KW", name: "Kuwait",        flag: "🇰🇼" },
  { code: "QA", name: "Qatar",         flag: "🇶🇦" },
  { code: "BH", name: "Bahrain",       flag: "🇧🇭" },
  { code: "OM", name: "Oman",          flag: "🇴🇲" },
  { code: "IQ", name: "Iraq",          flag: "🇮🇶" },
  { code: "FR", name: "France",        flag: "🇫🇷" },
  { code: "GB", name: "United Kingdom",flag: "🇬🇧" },
  { code: "DE", name: "Germany",       flag: "🇩🇪" },
  { code: "US", name: "United States", flag: "🇺🇸" },
];

// ─── Step indicator ───────────────────────────────────────────────────────────
type Step = "country" | "upload" | "loading" | "result" | "error";

function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ["country", "upload", "loading", "result"];
  const idx = steps.indexOf(step === "error" ? "result" : step);
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < idx ? "bg-blue-600" :
              i === idx ? "bg-blue-600 ring-4 ring-blue-100" :
              "bg-slate-200"
            }`}
          />
          {i < steps.length - 1 && (
            <div className={`h-px w-8 transition-all duration-300 ${i < idx ? "bg-blue-600" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Analysis Result ──────────────────────────────────────────────────────────
function AnalysisResult({ result, onReset }: { result: string; onReset: () => void }) {
  // Try to parse if JSON, else show raw text
  let content: React.ReactNode;
  try {
    const parsed = typeof result === "string" ? JSON.parse(result) : result;
    content = (
      <div className="space-y-4">
        {Object.entries(parsed).map(([key, value]) => (
          <div key={key} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-1">
              {key.replace(/_/g, " ")}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
            </p>
          </div>
        ))}
      </div>
    );
  } catch {
    content = (
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result}</p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={20} className="text-green-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-base">Analysis Complete</h3>
          <p className="text-xs text-slate-400">Your contract has been reviewed</p>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto pr-1 space-y-3 scrollbar-thin">
        {content}
      </div>

      <button
        onClick={onReset}
        className="w-full py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-bold text-sm hover:bg-blue-600 hover:text-white transition-all duration-200"
      >
        Analyze Another Contract
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";

  const [step, setStep] = useState<Step>("country");
  const [countryCode, setCountryCode] = useState<string>("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loadingMsg, setLoadingMsg] = useState("Uploading your contract…");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode);

  // ── File selection ──────────────────────────────────────────────────────────
  function handleFileSelect(f: File) {
    if (f.type !== "application/pdf") {
      setErrorMsg("Only PDF files are supported.");
      setStep("error");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setErrorMsg("File is too large. Maximum size is 20 MB.");
      setStep("error");
      return;
    }
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }

  // ── Main flow ───────────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!file || !countryCode) return;

    setStep("loading");
    setErrorMsg("");

    try {
      // 1. Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("You must be logged in to analyze a contract.");

      // 2. Insert upload row
      setLoadingMsg("Creating upload record…");
      const { data: uploadRow, error: insertError } = await supabase
        .from("contract_uploads")
        .insert({
          user_id: user.id,
          file_path: "pending",
          original_filename: file.name,
          mime_type: file.type,
          file_size_bytes: file.size,
          country_code: countryCode,
          upload_status: "uploaded",
          extraction_status: "pending",
          analysis_status: "pending",
        })
        .select("id")
        .single();

      if (insertError || !uploadRow) throw new Error("Failed to create upload record.");

      // 3. Upload file to storage
      setLoadingMsg("Uploading your contract…");
      const filePath = `${user.id}/${uploadRow.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("contract-uploads")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw new Error("Failed to upload file to storage.");

      // 4. Update file_path in DB
      setLoadingMsg("Saving file path…");
      await supabase
        .from("contract_uploads")
        .update({ file_path: filePath })
        .eq("id", uploadRow.id);

      // 5. Call Edge Function
      setLoadingMsg("Analyzing your contract with AI…");
      const { data, error: fnError } = await supabase.functions.invoke("analyze-contract", {
        body: { contract_upload_id: uploadRow.id },
      });

      if (fnError) throw new Error("Analysis failed. Please try again.");

      // 6. Show result
      const resultText =
        typeof data === "string"
          ? data
          : data?.result ?? data?.analysis ?? JSON.stringify(data);

      setResult(resultText);
      setStep("result");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("error");
    }
  }

  function reset() {
    setStep("country");
    setCountryCode("");
    setFile(null);
    setResult("");
    setErrorMsg("");
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <span className="inline-block bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4">
            AI-Powered
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Contract Analysis</h1>
          <p className="text-slate-500 text-base max-w-md mx-auto">
            Upload your contract PDF and get an instant AI-powered legal analysis based on the applicable country's law.
          </p>
        </div>
      </section>

      {/* Card */}
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">

          <StepDots step={step} />

          {/* ── Step 1: Country ── */}
          {step === "country" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe size={22} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Select Country</h2>
                <p className="text-sm text-slate-400">Which country's law applies to your contract?</p>
              </div>

              {/* Country dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setCountryOpen(!countryOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm transition ${
                    countryCode
                      ? "border-blue-600 bg-blue-50 text-slate-800 font-medium"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {selectedCountry ? (
                      <>
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-slate-800 font-medium">{selectedCountry.name}</span>
                      </>
                    ) : (
                      "Choose a country…"
                    )}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform ${countryOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {countryOpen && (
                  <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                    <div className="max-h-64 overflow-y-auto py-1">
                      {COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => {
                            setCountryCode(c.code);
                            setCountryOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-50 transition text-left ${
                            countryCode === c.code ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700"
                          }`}
                        >
                          <span className="text-base">{c.flag}</span>
                          <span>{c.name}</span>
                          {countryCode === c.code && <CheckCircle2 size={14} className="ml-auto text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                disabled={!countryCode}
                onClick={() => setStep("upload")}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-sm transition-all duration-200"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 2: Upload ── */}
          {step === "upload" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload size={22} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Upload Contract</h2>
                <p className="text-sm text-slate-400">
                  Analyzing under&nbsp;
                  <span className="font-semibold text-blue-600">
                    {selectedCountry?.flag} {selectedCountry?.name}
                  </span> law
                  &nbsp;·&nbsp;
                  <button onClick={() => { setStep("country"); setFile(null); }} className="underline text-slate-400 hover:text-blue-600 transition">
                    Change
                  </button>
                </p>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  file
                    ? "border-blue-600 bg-blue-50 cursor-default"
                    : dragOver
                    ? "border-blue-400 bg-blue-50 scale-[1.01]"
                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                />

                {file ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                      <FileCheck size={20} className="text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 break-all">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-600 mt-1"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
                      <FileText size={20} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600">
                      Drop your PDF here or <span className="text-blue-600">browse</span>
                    </p>
                    <p className="text-xs text-slate-400">PDF only · Max 20 MB</p>
                  </div>
                )}
              </div>

              <button
                disabled={!file}
                onClick={handleAnalyze}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-sm transition-all duration-200"
              >
                Analyze Contract
              </button>
            </div>
          )}

          {/* ── Step 3: Loading ── */}
          {step === "loading" && (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <Loader2 size={28} className="text-blue-600 animate-spin" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">Please wait…</h2>
                <p className="text-sm text-slate-400">{loadingMsg}</p>
              </div>
              {/* Progress dots */}
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Result ── */}
          {step === "result" && (
            <AnalysisResult result={result} onReset={reset} />
          )}

          {/* ── Error ── */}
          {step === "error" && (
            <div className="py-6 text-center space-y-5">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={22} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">Something went wrong</h2>
                <p className="text-sm text-slate-500">{errorMsg}</p>
              </div>
              <button
                onClick={reset}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition"
              >
                Try Again
              </button>
            </div>
          )}

        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Your documents are processed securely and never stored beyond analysis.
        </p>
      </div>
    </div>
  );
}
