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
        className={`relative min-h-8 min-w-8 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-tight transition-all duration-200 ease-out sm:min-w-9 sm:px-2 sm:text-[11px] ${
          active
            ? "bg-btc-gold text-[#140b07] shadow-[0_4px_12px_rgba(247,147,26,0.22)]"
            : "text-[var(--cavos-subtle)] hover:text-[var(--cavos-muted)]"
        } `}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={`inline-flex rounded-full bg-black/20 p-0.5 ring-1 ring-[var(--cavos-border)] ${className}`}
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
