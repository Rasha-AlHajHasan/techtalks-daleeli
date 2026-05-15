"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ar", name: "العربية", flag: "🇱🇧" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
      router.refresh();
    });
  };

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <Select value={locale} onValueChange={handleLanguageChange} disabled={isPending}>
      <SelectTrigger className="w-auto min-w-27.5 gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:ring-2 focus:ring-slate-100 focus:border-slate-300">
        <Languages className="h-4 w-4 shrink-0 text-slate-500" />
        <SelectValue placeholder={t("languageSelector")}>
          <span className="flex items-center gap-2">
            <span>{currentLanguage?.flag}</span>
            <span className="hidden sm:inline">{currentLanguage?.name}</span>
          </span>
        </SelectValue>
      </SelectTrigger>

      <SelectContent
        position="popper"
        side="bottom"
        align="end"
        className="z-150 rounded-xl border border-slate-200 bg-white shadow-md overflow-hidden"
      >
        {languages.map((lang) => (
          <SelectItem
            key={lang.code}
            value={lang.code}
            className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-700 focus:bg-slate-50 focus:text-slate-900"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
