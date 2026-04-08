"use client";

import type { LeaderboardRow } from "@/lib/types";
import { useI18n } from "@/context/locale-context";
import { formatBtc } from "@/lib/format";

type Props = {
  rows: LeaderboardRow[];
  highlightUsername?: string | null;
  /** Spot BTC/USD for imaginary value display; null if unavailable. */
  priceUsd: number | null;
};

function formatUsd(btc: number, priceUsd: number, numberLocale: string) {
  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 6,
  }).format(btc * priceUsd);
}

export function LeaderboardPanel({
  rows,
  highlightUsername,
  priceUsd,
}: Props) {
  const { t, intlLocale } = useI18n();

  return (
    <section className="rounded-2xl border border-black/[0.05] bg-[#F7F5F2] p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-btc-orange/5 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <h2 className="mb-1 text-sm font-semibold tracking-wide text-[#0A0908]">
          {t("leaderboard.title")}
        </h2>
        <p className="mb-4 text-[11px] leading-snug text-black/40 sm:text-xs">
          {t("leaderboard.subtitle")}
        </p>

        <div className="mb-3 hidden grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] gap-x-3 border-b border-black/[0.06] px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-black/35 sm:grid">
          <span>{t("leaderboard.colRank")}</span>
          <span>{t("leaderboard.colPlayer")}</span>
          <span className="text-right">{t("leaderboard.colBtc")}</span>
          <span className="text-right">{t("leaderboard.colUsd")}</span>
        </div>

        <ul className="space-y-1">
          {rows.map((row, i) => {
            const isYou = highlightUsername && row.username === highlightUsername;
            
            // Top 3 positions logic
            const isTop1 = i === 0;
            const isTop2 = i === 1;
            const isTop3 = i === 2;
            const isTop3Any = isTop1 || isTop2 || isTop3;

            let rowClasses = "px-3 py-3 text-sm font-medium sm:grid sm:grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-x-3 sm:py-3 transition-colors duration-300 rounded-xl ";
            
            if (isTop1) {
              rowClasses += "bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 shadow-sm shadow-yellow-500/10 mb-3 relative overflow-hidden z-10 font-medium";
            } else if (isTop2) {
              rowClasses += "bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 shadow-sm shadow-black/5 mb-2 z-10 font-medium";
            } else if (isTop3) {
              rowClasses += "bg-orange-100 hover:bg-orange-200 border border-orange-300 shadow-sm shadow-orange-500/10 mb-2 z-10 font-medium";
            } else {
              rowClasses += isYou ? "bg-[#F7F5F2] mb-1 border border-black/10" : "hover:bg-black/[0.02] border-b border-transparent hover:border-black/5 last:border-transparent rounded-none";
            }

            return (
              <li
                key={`${row.username}-${i}`}
                className={rowClasses}
              >
                {/* For Top 1: animate a subtle sweep effect in the background */}
                {isTop1 && (
                  <div className="absolute inset-0 -translate-x-[100%] animate-[sweep_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent pointer-events-none" />
                )}
                
                <span className={`mb-2 inline-block w-6 tabular-nums sm:mb-0 ${
                  isTop1 ? "text-yellow-600 font-bold" : 
                  isTop2 ? "text-neutral-500 font-bold" : 
                  isTop3 ? "text-orange-600 font-bold" : "text-black/35"
                }`}>
                  {i + 1}
                </span>
                <span className={`mb-2 flex flex-wrap items-center gap-2 sm:mb-0 ${isTop3Any ? "text-[#0A0908]" : "text-[#0A0908]"}`}>
                  {row.username}
                  {isYou && (
                    <span className="rounded-md bg-[#ea860f] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ring-1 ring-black/5">
                      {t("common.you")}
                    </span>
                  )}
                  {isTop3Any && (
                    <span className="text-[12px] opacity-100 drop-shadow-sm" title="¡Ganador de Cupón CofiBlocks!">☕️</span>
                  )}
                </span>
                <span className={`mb-1 block text-right tabular-nums font-semibold sm:mb-0 ${
                  isTop1 ? "text-yellow-600" : 
                  isTop2 ? "text-[#0A0908]" : 
                  isTop3 ? "text-orange-600" : "text-[#0A0908]"
                }`}>
                  {formatBtc(row.bestBtcMined, intlLocale)}
                </span>
                <span className="block text-right tabular-nums text-black/40 sm:mb-0">
                  {priceUsd != null
                    ? formatUsd(row.bestBtcMined, priceUsd, intlLocale)
                    : "—"}
                </span>
              </li>
            );
          })}
        </ul>
        {rows.length === 0 && (
          <p className="text-sm text-black/40 pt-2">{t("leaderboard.empty")}</p>
        )}
      </div>
    </section>
  );
}
