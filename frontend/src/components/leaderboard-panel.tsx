"use client";

import type { CSSProperties } from "react";
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

/** Colores en inline — el verde se ve siempre (evita utilidades Tailwind no emitidas). */
const USD_CHIP_STYLE: CSSProperties = {
  backgroundColor: "#d1fae5",
  color: "#047857",
  border: "1px solid rgba(16, 185, 129, 0.55)",
  borderRadius: "0.5rem",
  padding: "0.25rem 0.625rem",
  fontWeight: 800,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "-0.02em",
  lineHeight: 1.25,
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.65), 0 2px 10px rgba(5, 150, 105, 0.2)",
};

export function LeaderboardPanel({
  rows,
  highlightUsername,
  priceUsd,
}: Props) {
  const { t, intlLocale } = useI18n();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-black/5 bg-[#F7F5F2] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-btc-orange/5 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <h2 className="mb-1 text-sm font-semibold tracking-wide text-[#0A0908]">
          {t("leaderboard.title")}
        </h2>
        <p className="mb-4 text-[11px] leading-snug text-black/40 sm:text-xs">
          {t("leaderboard.subtitle")}
        </p>

        <div className="mb-3 hidden grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] gap-x-3 border-b border-black/6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-black/35 sm:grid">
          <span>{t("leaderboard.colRank")}</span>
          <span>{t("leaderboard.colPlayer")}</span>
          <span className="text-right">{t("leaderboard.colBtc")}</span>
          <span
            className="text-right font-semibold"
            style={{ color: "#047857" }}
          >
            {t("leaderboard.colUsd")}
          </span>
        </div>

        <ul className="space-y-2">
          {rows.map((row, i) => {
            const isYou = highlightUsername && row.username === highlightUsername;
            const rank = i + 1;
            const isPodium = rank <= 3;
            const isTop1 = rank === 1;
            const isTop2 = rank === 2;

            const baseRow =
              "relative px-3 py-3 text-sm font-medium sm:grid sm:grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-x-3 sm:py-3";

            const rowClasses = [
              baseRow,
              "rounded-xl border transition-colors duration-200",
              isPodium
                ? isTop1
                  ? "border-amber-300/55 bg-linear-to-br from-amber-50 to-orange-50/90 shadow-sm shadow-amber-900/5 ring-1 ring-amber-400/15"
                  : isTop2
                    ? "border-black/10 bg-linear-to-br from-[#f3f0ea] to-[#ebe4d8] shadow-sm ring-1 ring-black/5"
                    : "border-[#ea860f]/30 bg-linear-to-br from-[#fff8f0] to-[#ffecd4]/80 shadow-sm ring-1 ring-btc-orange/12"
                : isYou
                  ? "border-black/8 bg-[#F7F5F2] hover:bg-[#f2efe9]"
                  : "border-black/6 bg-white/65 hover:bg-white/95",
            ].join(" ");

            return (
              <li key={`${row.username}-${i}`} className={rowClasses}>
                <span
                  className={`mb-2 inline-block w-6 tabular-nums sm:mb-0 ${
                    isPodium
                      ? "font-bold text-[#0A0908]"
                      : "font-medium text-black/35"
                  }`}
                >
                  {rank}
                </span>
                <span className="mb-2 flex flex-wrap items-center gap-2 text-[#0A0908] sm:mb-0">
                  {row.username}
                  {isYou && (
                    <span className="rounded-md bg-[#ea860f] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ring-1 ring-black/5">
                      {t("common.you")}
                    </span>
                  )}
                  {isPodium && (
                    <span
                      className="text-[12px] drop-shadow-sm"
                      title="CofiBlocks"
                      aria-hidden
                    >
                      ☕️
                    </span>
                  )}
                </span>
                <span
                  className={`mb-1 block text-right tabular-nums font-semibold sm:mb-0 ${
                    isPodium ? "text-[#0A0908]" : "text-[#0A0908]"
                  }`}
                >
                  {formatBtc(row.bestBtcMined, intlLocale)}
                </span>
                <div className="flex justify-end sm:mb-0">
                  {priceUsd != null ? (
                    <span
                      className="inline-block max-w-full text-[13px] sm:text-sm"
                      style={USD_CHIP_STYLE}
                    >
                      {formatUsd(row.bestBtcMined, priceUsd, intlLocale)}
                    </span>
                  ) : (
                    <span className="py-1 text-right text-black/35 tabular-nums">
                      —
                    </span>
                  )}
                </div>
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
