"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  FileText, Upload, ChevronDown, CheckCircle2,
  AlertCircle, Loader2, Globe, X, FileCheck,
  ShieldCheck, ClipboardList, AlertTriangle,
  XCircle, Info, Star, RotateCcw, MessageSquare, Gavel,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase/browser";

// â”€â”€â”€ Countries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COUNTRIES = [
  { code: "LB", flag: "🇱🇧" },
  { code: "SA", flag: "🇸🇦" },
  { code: "AE", flag: "🇦🇪" },
  { code: "EG", flag: "🇪🇬" },
  { code: "JO", flag: "🇯🇴" },
  { code: "KW", flag: "🇰🇼" },
  { code: "QA", flag: "🇶🇦" },
  { code: "BH", flag: "🇧🇭" },
  { code: "OM", flag: "🇴🇲" },
  { code: "IQ", flag: "🇮🇶" },
  { code: "FR", flag: "🇫🇷" },
  { code: "GB", flag: "🇬🇧" },
  { code: "DE", flag: "🇩🇪" },
  { code: "US", flag: "🇺🇸" },
] as const;

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Step = "country" | "upload" | "loading" | "result" | "error";

interface RightsAndObligations {
  employee_rights?: string[];
  employee_obligations?: string[];
  employer_obligations?: string[];
}

interface ParsedAnalysis {
  summary?: string;
  overall_verdict?: string;
  score?: number;
  rights_and_obligations?: RightsAndObligations;
  legal_implications?: string[];
  country_specific_notes?: string[];
  missing_clauses?: string[];
  risk_flags?: string[];
  duties?: string[];
  recommendation?: string;
}

// â”€â”€â”€ Verdict config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const VERDICT_CONFIG = {
  GOOD: {
    labelKey: "verdict.good",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    iconColor: "text-emerald-600",
    ring: "ring-emerald-100",
  },
  FAIR: {
    labelKey: "verdict.fair",
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    iconColor: "text-blue-600",
    ring: "ring-blue-100",
  },
  CONCERNING: {
    labelKey: "verdict.concerning",
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    iconColor: "text-amber-600",
    ring: "ring-amber-100",
  },
  "RED FLAGS": {
    labelKey: "verdict.redFlags",
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    iconColor: "text-red-600",
    ring: "ring-red-100",
  },
} as const;

// â”€â”€â”€ Step Dots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Score Ring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ScoreRing({ score }: { score: number }) {
  const t = useTranslations("services.result");
  const clamped = Math.min(100, Math.max(0, score));
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color =
    clamped >= 70 ? "#10b981" :
    clamped >= 45 ? "#3b82f6" :
    clamped >= 25 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="7" />
          <circle
            cx="40" cy="40" r={radius}
            fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-extrabold text-slate-800">{clamped}</span>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{t("score")}</p>
    </div>
  );
}

// â”€â”€â”€ List Items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ListItems({ items, variant = "default" }: {
  items: string[];
  variant?: "default" | "warning" | "danger" | "success";
}) {
  const bulletColor =
    variant === "danger" ? "bg-red-400" :
    variant === "warning" ? "bg-amber-400" :
    variant === "success" ? "bg-emerald-400" :
    "bg-slate-300";

  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${bulletColor}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

// â”€â”€â”€ Questions To Ask â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function QuestionsToAsk({ missing, flags }: { missing: string[]; flags: string[] }) {
  const t = useTranslations("services.result");
  const questions: string[] = [];
  missing.forEach((clause) => questions.push(t("questionForMissing", { clause })));
  flags.forEach((flag) => questions.push(t("questionForFlag", { flag })));
  if (questions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 space-y-3">
      <div className="flex items-center gap-2 text-violet-700">
        <MessageSquare size={14} />
        <h4 className="text-[11px] font-bold uppercase tracking-widest">{t("askCompany")}</h4>
      </div>
      <ul className="space-y-2">
        {questions.map((q, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-violet-200 flex items-center justify-center">
              <span className="text-[9px] font-bold text-violet-700">{i + 1}</span>
            </span>
            <span className="text-sm text-violet-800 leading-relaxed">{q}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// â”€â”€â”€ Analysis Result â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AnalysisResult({ result, onReset }: { result: string; onReset: () => void }) {
  const t = useTranslations("services.result");
  let parsed: ParsedAnalysis = {};
  try {
    parsed = typeof result === "string" ? JSON.parse(result) : result;
  } catch {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{result}</p>
        <button onClick={onReset} className="w-full py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-bold text-sm hover:bg-blue-600 hover:text-white transition-all duration-200">
          {t("analyzeAnother")}
        </button>
      </div>
    );
  }

  const verdictKey = (parsed.overall_verdict?.toUpperCase() as keyof typeof VERDICT_CONFIG) ?? "FAIR";
  const verdict = VERDICT_CONFIG[verdictKey] ?? VERDICT_CONFIG.FAIR;
  const VerdictIcon = verdict.icon;
  const rights = parsed.rights_and_obligations ?? {};
  const hasMissingOrFlags = (parsed.missing_clauses?.length ?? 0) > 0 || (parsed.risk_flags?.length ?? 0) > 0;

  return (
    <div className="space-y-5">
      {/* Verdict Header */}
      <div className={`rounded-2xl border p-4 ${verdict.bg} ${verdict.border}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-4 ${verdict.ring} bg-white`}>
              <VerdictIcon size={18} className={verdict.iconColor} />
            </div>
            <div>
              <p className={`font-extrabold text-base ${verdict.text}`}>{t(verdict.labelKey)}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t("complete")}</p>
            </div>
          </div>
          {parsed.score !== undefined && <ScoreRing score={parsed.score} />}
        </div>
        {parsed.summary && (
          <p className="mt-3 text-sm text-slate-600 leading-relaxed border-t border-white/60 pt-3">
            {parsed.summary}
          </p>
        )}
      </div>

      {/* Scrollable body */}
      <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">

        {parsed.recommendation && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <Star size={15} />
              <h4 className="text-[11px] font-bold uppercase tracking-widest">{t("recommendation")}</h4>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{parsed.recommendation}</p>
          </div>
        )}

        {hasMissingOrFlags && (
          <QuestionsToAsk missing={parsed.missing_clauses ?? []} flags={parsed.risk_flags ?? []} />
        )}

        {(parsed.risk_flags?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle size={15} />
              <h4 className="text-[11px] font-bold uppercase tracking-widest">{t("riskFlags")}</h4>
            </div>
            <ListItems items={parsed.risk_flags!} variant="danger" />
          </div>
        )}

        {(parsed.missing_clauses?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertTriangle size={15} />
              <h4 className="text-[11px] font-bold uppercase tracking-widest">{t("missingClauses")}</h4>
            </div>
            <ListItems items={parsed.missing_clauses!} variant="warning" />
          </div>
        )}

        {(parsed.country_specific_notes?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Gavel size={15} />
              <h4 className="text-[11px] font-bold uppercase tracking-widest">{t("countryRules")}</h4>
            </div>
            <ListItems items={parsed.country_specific_notes!} />
          </div>
        )}

        {(rights.employee_rights?.length || rights.employee_obligations?.length || rights.employer_obligations?.length) && (
          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-4">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck size={15} />
              <h4 className="text-[11px] font-bold uppercase tracking-widest">{t("rightsObligations")}</h4>
            </div>
            {rights.employee_rights && rights.employee_rights.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">{t("yourRights")}</p>
                <ListItems items={rights.employee_rights} variant="success" />
              </div>
            )}
            {rights.employee_obligations && rights.employee_obligations.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("yourObligations")}</p>
                <ListItems items={rights.employee_obligations} />
              </div>
            )}
            {rights.employer_obligations && rights.employer_obligations.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-2">{t("employerObligations")}</p>
                <ListItems items={rights.employer_obligations} />
              </div>
            )}
          </div>
        )}

        {(parsed.legal_implications?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <Gavel size={15} />
              <h4 className="text-[11px] font-bold uppercase tracking-widest">{t("legalImplications")}</h4>
            </div>
            <ListItems items={parsed.legal_implications!} />
          </div>
        )}

        {(parsed.duties?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <ClipboardList size={15} />
              <h4 className="text-[11px] font-bold uppercase tracking-widest">{t("jobDuties")}</h4>
            </div>
            <ListItems items={parsed.duties!} />
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-bold text-sm hover:bg-blue-600 hover:text-white transition-all duration-200"
      >
        <RotateCcw size={14} />
        {t("analyzeAnother")}
      </button>
    </div>
  );
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ServicesPage() {
  const t = useTranslations("services");

  const [step, setStep] = useState<Step>("country");
  const [countryCode, setCountryCode] = useState<string>("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loadingMsg, setLoadingMsg] = useState("loading.uploading");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  const selectedCountryName = selectedCountry
    ? t(`countries.${selectedCountry.code}`)
    : "";

  function handleFileSelect(f: File) {
    if (f.type !== "application/pdf") {
      setErrorMsg(t("errors.pdfOnly"));
      setStep("error");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setErrorMsg(t("errors.fileTooLarge"));
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

 async function handleAnalyze() {
  if (!file || !countryCode) return;

  setStep("loading");
  setErrorMsg("");

  try {
    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error(t("errors.loginRequired"));

    // 2. Extract text from PDF in the browser
    setLoadingMsg("loading.reading");
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let extractedText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => (item.str ?? ""))
        .join(" ");
      extractedText += pageText + "\n";
    }

    if (extractedText.trim().length < 50) {
      throw new Error(t("errors.unreadablePdf"));
    }

    // Limit to ~12000 chars
    const contractText = extractedText.trim().slice(0, 12000);

    // 3. Insert upload row
    setLoadingMsg("loading.creatingRecord");
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

    if (insertError || !uploadRow) {
      throw new Error(`Failed to create upload record: ${insertError?.message}`);
    }

    // 4. Upload file to storage
    setLoadingMsg("loading.uploading");
    const filePath = `${user.id}/${uploadRow.id}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("contract-uploads")
      .upload(filePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // 5. Update file_path in DB
    await supabase
      .from("contract_uploads")
      .update({ file_path: filePath })
      .eq("id", uploadRow.id);

    // 6. Call Edge Function â€” pass extracted text directly
    setLoadingMsg("loading.analyzing");
    const { data, error: fnError } = await supabase.functions.invoke("analyze-contract", {
      body: {
        contract_upload_id: uploadRow.id,
        contract_text: contractText,   // â† send text directly
      },
    });

    if (fnError || data?.error) {
      throw new Error(data?.error ?? fnError?.message ?? "Edge function failed");
    }

    const resultText =
      typeof data === "string"
        ? data
        : data?.result ?? data?.analysis ?? JSON.stringify(data);

    setResult(resultText);
    setStep("result");

  } catch (err: unknown) {
    setErrorMsg(err instanceof Error ? err.message : JSON.stringify(err));
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

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <span className="inline-block bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4">
            {t("hero.badge")}
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">{t("hero.title")}</h1>
          <p className="text-slate-500 text-base max-w-md mx-auto">
            {t("hero.description")}
          </p>
        </div>
      </section>

      {/* Card */}
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">

          <StepDots step={step} />

          {/* Step 1: Country */}
          {step === "country" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe size={22} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">{t("country.title")}</h2>
                <p className="text-sm text-slate-400">{t("country.description")}</p>
              </div>

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
                        <span className="text-slate-800 font-medium">{selectedCountryName}</span>
                      </>
                    ) : t("country.placeholder")}
                  </span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${countryOpen ? "rotate-180" : ""}`} />
                </button>

                {countryOpen && (
                  <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                    <div className="max-h-64 overflow-y-auto py-1">
                      {COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setCountryCode(c.code); setCountryOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-50 transition text-left ${
                            countryCode === c.code ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700"
                          }`}
                        >
                          <span className="text-base">{c.flag}</span>
                          <span>{t(`countries.${c.code}`)}</span>
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
                {t("country.continue")}
              </button>
            </div>
          )}

          {/* Step 2: Upload */}
          {step === "upload" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload size={22} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">{t("upload.title")}</h2>
                <p className="text-sm text-slate-400">
                  {t("upload.analyzingUnder")} {" "}
                  <span className="font-semibold text-blue-600">
                    {selectedCountry?.flag} {selectedCountryName}
                  </span>{" "}
                  {t("upload.law")}
                  {" · "}
                  <button onClick={() => { setStep("country"); setFile(null); }} className="underline text-slate-400 hover:text-blue-600 transition">
                    {t("upload.change")}
                  </button>
                </p>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  file ? "border-blue-600 bg-blue-50 cursor-default" :
                  dragOver ? "border-blue-400 bg-blue-50 scale-[1.01]" :
                  "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
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
                      <X size={12} /> {t("upload.remove")}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
                      <FileText size={20} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600">
                      {t("upload.dropPrefix")} <span className="text-blue-600">{t("upload.browse")}</span>
                    </p>
                    <p className="text-xs text-slate-400">{t("upload.requirements")}</p>
                  </div>
                )}
              </div>

              <button
                disabled={!file}
                onClick={handleAnalyze}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-sm transition-all duration-200"
              >
                {t("upload.analyze")}
              </button>
            </div>
          )}

          {/* Step 3: Loading */}
          {step === "loading" && (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <Loader2 size={28} className="text-blue-600 animate-spin" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">{t("loading.title")}</h2>
                <p className="text-sm text-slate-400">{t(loadingMsg)}</p>
              </div>
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

          {/* Step 4: Result */}
          {step === "result" && (
            <AnalysisResult result={result} onReset={reset} />
          )}

          {/* Error */}
          {step === "error" && (
            <div className="py-6 text-center space-y-5">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={22} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">{t("error.title")}</h2>
                <p className="text-sm text-slate-500 break-all">{errorMsg}</p>
              </div>
              <button
                onClick={reset}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition"
              >
                {t("error.tryAgain")}
              </button>
            </div>
          )}

        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          {t("securityNote")}
        </p>
      </div>
    </div>
  );
}
