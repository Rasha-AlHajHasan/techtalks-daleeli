"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  CreditCard,
  Building,
  Globe,
  Info,
  Scale,
  FolderSync,
} from "lucide-react";
import { Syndicate, Requirement, Document } from "./page";

interface PageUIProps {
  syndicate: Syndicate;
  requirements: Requirement | null;
  documents: Document[];
  locale: string;
}

export default function PageUI({
  syndicate,
  requirements,
  documents,
  locale,
}: PageUIProps) {
  const isArabic = locale === "ar";
  const BackArrow = isArabic ? ArrowRight : ArrowLeft;

  const description = isArabic
    ? syndicate.description_ar
    : syndicate.description_en || syndicate.description_ar;

  return (
    <div
      className="flex-1 bg-slate-50 text-slate-800 pb-20"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <section className="bg-slate-50 pt-32 pb-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-10">
            <Link
              href={`/${locale}/syndicates`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-700 transition-colors w-fit"
            >
              <BackArrow size={16} />
              {isArabic ? "العودة إلى الدليل" : "Back to Directory"}
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-center justify-center relative overflow-hidden group">
              {syndicate.logo_url ? (
                <Image
                  src={syndicate.logo_url}
                  alt={syndicate.name}
                  fill
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <Building className="text-slate-300" size={48} />
              )}
            </div>

            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-700 mb-4 block">
                {isArabic ? "الملف التعريفي للنقابة" : "Syndicate Profile"}
              </span>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-5 leading-tight">
                {syndicate.name}
              </h1>
              <p className="text-base text-slate-600 max-w-3xl leading-relaxed mb-8">
                {description ||
                  (isArabic
                    ? "لا يوجد وصف متاح حالياً."
                    : "No description available at the moment.")}
              </p>

              {syndicate.official_website && (
                <a
                  href={syndicate.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-800 transition shadow-sm w-fit"
                >
                  <Globe size={18} />
                  {isArabic ? "زيارة الموقع الرسمي" : "Visit Official Website"}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 pt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center shrink-0">
                <Scale size={24} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {requirements?.title_ar ||
                    (isArabic ? "شروط الانتساب" : "Eligibility Requirements")}
                </h2>
                {requirements?.description_ar && (
                  <p className="text-sm text-slate-500 mt-1">
                    {requirements.description_ar}
                  </p>
                )}
              </div>
            </div>

            {requirements?.eligibility_conditions?.length ? (
              <ul className="space-y-4">
                {requirements.eligibility_conditions.map((condition, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100"
                  >
                    <span className="mt-0.5 text-blue-600 shrink-0">
                      <CheckCircle2 size={18} strokeWidth={2} />
                    </span>
                    {condition}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                <FolderSync className="text-slate-300 mb-4" size={32} />
                <h3 className="text-sm font-bold text-slate-700 mb-1">
                  {isArabic ? "جاري تحديث الشروط" : "Requirements Updating"}
                </h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  {isArabic
                    ? "لا توجد شروط محددة مدرجة حالياً في النظام. يرجى مراجعة الموقع الرسمي للنقابة."
                    : "No specific conditions are currently listed in the system. Please check the official syndicate website."}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center shrink-0">
                <FileText size={24} strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {isArabic ? "المستندات المطلوبة" : "Required Documents"}
              </h2>
            </div>

            {documents?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc, index) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm font-bold text-slate-900 block leading-snug">
                      {doc.name_ar}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                <FileText className="text-slate-300 mb-4" size={32} />
                <h3 className="text-sm font-bold text-slate-700 mb-1">
                  {isArabic
                    ? "قائمة المستندات غير متوفرة"
                    : "Documents Unavailable"}
                </h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  {isArabic
                    ? "لم يتم إدراج المستندات المطلوبة للتحميل بعد."
                    : "Required documents have not been listed for download yet."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm sticky top-28">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <CreditCard size={24} strokeWidth={2} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {isArabic ? "الرسوم المتوقعة" : "Expected Fees"}
              </h2>
            </div>

            {requirements?.fees && requirements.fees.length > 0 ? (
              <ul className="space-y-3">
                {requirements.fees.map((fee, index) => (
                  <li
                    key={index}
                    className="flex flex-col p-4 bg-slate-50 rounded-xl border border-slate-100 gap-2"
                  >
                    <span className="text-sm text-slate-600 font-semibold">
                      {fee.type}
                    </span>
                    <span className="text-lg font-extrabold text-emerald-700">
                      {fee.amount.toLocaleString()}{" "}
                      <span className="text-xs text-emerald-600/80 font-bold uppercase">
                        {fee.currency}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                <Info className="text-slate-300 mb-3" size={24} />
                <p className="text-sm font-medium text-slate-500">
                  {isArabic
                    ? "لم يتم تحديد هيكل الرسوم بعد."
                    : "Fee structure has not been specified yet."}
                </p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 block">
                {isArabic ? "ملاحظة هامة" : "Important Note"}
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isArabic
                  ? "المعلومات الواردة أعلاه قابلة للتحديث. يُرجى مراجعة النقابة أو الموقع الرسمي للحصول على أحدث التفاصيل والإجراءات."
                  : "The information above is subject to change. Please consult the syndicate or official website for the latest procedures."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
