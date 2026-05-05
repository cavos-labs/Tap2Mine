"use client";

import type { Locale } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/context/locale-context";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  const option = (code: Locale, label: string) => {
    const active = locale === code;
    return (
      <button
        key={code}
        type="button"
        onClick={() => setLocale(code)}
        className={`relative min-w-8 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-tight tracking-tight transition-all duration-200 ease-out sm:min-w-9 sm:px-2 sm:text-[11px] ${
          active
            ? "bg-white text-[#0A0908] shadow-[0_1px_4px_rgba(10,9,8,0.1)] ring-1 ring-black/6"
            : "text-black/40 hover:text-black/55"
        } `}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={`inline-flex rounded-full bg-[var(--cavos-surface-quiet)] p-0.5 ring-1 ring-[var(--cavos-border)] ${className}`}
      role="group"
      aria-label={t("language.label")}
    >
      <div className="flex items-center gap-px">
        {option("es", t("language.es"))}
        {option("en", t("language.en"))}
      </div>
    </div>
  );
}
