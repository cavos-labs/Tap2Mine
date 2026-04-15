"use client";

import type { CSSProperties } from "react";
import type { LeaderboardRow } from "@/lib/types";
import { useI18n } from "@/context/locale-context";
import { formatBtc } from "@/lib/format";

type Props = {
  rows: LeaderboardRow[];
  highlightUsername?: string | null;
  priceUsd: number | null;
};

function formatUsd(btc: number, priceUsd: number, numberLocale: string) {
  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 6,
  }).format(btc * priceUsd);
}

const PODIUM_STYLE: Record<1 | 2 | 3, CSSProperties> = {
  1: {
    background:
      "linear-gradient(135deg, rgba(255,244,220,0.98), rgba(255,233,192,0.88))",
    border: "1px solid rgba(245, 158, 11, 0.32)",
    boxShadow: "0 18px 34px rgba(180, 83, 9, 0.12)",
  },
  2: {
    background:
      "linear-gradient(135deg, rgba(244,246,251,0.98), rgba(228,233,241,0.9))",
    border: "1px solid rgba(100, 116, 139, 0.24)",
    boxShadow: "0 16px 30px rgba(15, 23, 42, 0.08)",
  },
  3: {
    background:
      "linear-gradient(135deg, rgba(255,241,232,0.98), rgba(255,226,208,0.88))",
    border: "1px solid rgba(234, 88, 12, 0.24)",
    boxShadow: "0 16px 30px rgba(154, 52, 18, 0.09)",
  },
};

const USD_CHIP_STYLE: CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(214,255,236,0.95), rgba(191,245,220,0.95))",
  color: "#066a49",
  border: "1px solid rgba(16, 185, 129, 0.38)",
  borderRadius: "999px",
  padding: "0.42rem 0.8rem",
  fontWeight: 800,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "-0.02em",
  lineHeight: 1.25,
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.65), 0 10px 20px rgba(5, 150, 105, 0.15)",
};

export function LeaderboardPanel({
  rows,
  highlightUsername,
  priceUsd,
}: Props) {
  const { locale, t, intlLocale } = useI18n();

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/55 bg-[linear-gradient(180deg,rgba(255,251,245,0.94),rgba(246,239,229,0.88))] p-4 shadow-[0_24px_80px_rgba(69,39,15,0.12)] sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,147,26,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.4),transparent_65%)]" />
      <div className="absolute right-0 bottom-0 h-44 w-44 translate-x-10 translate-y-12 rounded-full bg-[rgba(95,56,23,0.08)] blur-3xl" />

      <div className="relative z-10">
        <div className="flex flex-col gap-3 border-b border-[#d8c8b5]/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-[#eadbc7] bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7a5431]">
              {locale === "es" ? "Hall of miners" : "Hall of miners"}
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#120c08] sm:text-[2rem]">
              {t("leaderboard.title")}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#4e4035]/68">
              {t("leaderboard.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-[#e6d7c5] bg-white/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6c4b2e]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#14b86a]" />
            {priceUsd != null
              ? locale === "es"
                ? "BTC spot activo"
                : "BTC spot live"
              : locale === "es"
                ? "BTC spot no disponible"
                : "BTC spot unavailable"}
          </div>
        </div>

        <div className="mt-5 hidden grid-cols-[4.25rem_minmax(0,1fr)_auto_auto] gap-x-4 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7d6f64] sm:grid">
          <span>{t("leaderboard.colRank")}</span>
          <span>{t("leaderboard.colPlayer")}</span>
          <span className="text-right">{t("leaderboard.colBtc")}</span>
          <span className="text-right">{t("leaderboard.colUsd")}</span>
        </div>

        <ul className="mt-4 space-y-3">
          {rows.map((row, i) => {
            const isYou = highlightUsername && row.username === highlightUsername;
            const rank = i + 1;
            const isPodium = rank <= 3;

            const rowClasses = [
              "relative overflow-hidden rounded-[1.35rem] px-4 py-4 transition-all duration-200 sm:grid sm:grid-cols-[4.25rem_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-x-4",
              isPodium
                ? ""
                : isYou
                  ? "border border-[#d9c8b2] bg-[rgba(255,249,240,0.88)] shadow-[0_16px_30px_rgba(80,49,20,0.08)] hover:-translate-y-0.5"
                  : "border border-white/60 bg-white/72 shadow-[0_14px_26px_rgba(80,49,20,0.05)] hover:-translate-y-0.5 hover:bg-white/90",
            ].join(" ");

            const rowStyle: CSSProperties | undefined = isPodium
              ? PODIUM_STYLE[rank as 1 | 2 | 3]
              : undefined;

            const medal =
              rank === 1 ? "01" : rank === 2 ? "02" : rank === 3 ? "03" : null;

            return (
              <li key={`${row.username}-${i}`} className={rowClasses} style={rowStyle}>
                <div className="absolute inset-y-0 right-0 w-24 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.26))]" />

                <div className="mb-3 flex items-center gap-3 sm:mb-0">
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold tabular-nums ${
                      isPodium
                        ? "border-white/50 bg-white/45 text-[#1c140d]"
                        : "border-black/6 bg-white/70 text-[#5a4b3d]"
                    }`}
                  >
                    {medal ?? `#${rank}`}
                  </span>
                  <div className="sm:hidden">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6f64]">
                      {t("leaderboard.colPlayer")}
                    </p>
                    <p className="mt-1 text-base font-semibold text-[#120c08]">
                      {row.username}
                    </p>
                  </div>
                </div>

                <div className="mb-3 hidden min-w-0 sm:block sm:mb-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-base font-semibold text-[#120c08]">
                      {row.username}
                    </span>
                    {isYou && (
                      <span className="rounded-full border border-[#e29937]/35 bg-[#ea860f] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">
                        {t("common.you")}
                      </span>
                    )}
                    {isPodium && (
                      <span
                        className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[rgba(86,55,26,0.08)] px-2 text-sm"
                        title="CofiBlocks"
                        aria-hidden
                      >
                        ☕
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-2 flex items-center justify-between gap-3 sm:mb-0 sm:block sm:text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6f64] sm:hidden">
                    {t("leaderboard.colBtc")}
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-[#120c08]">
                    {formatBtc(row.bestBtcMined, intlLocale)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6f64] sm:hidden">
                    {t("leaderboard.colUsd")}
                  </span>
                  {priceUsd != null ? (
                    <span
                      className="inline-flex max-w-full items-center justify-center text-[13px] sm:text-sm"
                      style={USD_CHIP_STYLE}
                    >
                      {formatUsd(row.bestBtcMined, priceUsd, intlLocale)}
                    </span>
                  ) : (
                    <span className="rounded-full border border-black/6 bg-white/60 px-3 py-1.5 text-right text-black/35 tabular-nums">
                      —
                    </span>
                  )}
                </div>

                {isYou && (
                  <div className="mt-3 sm:hidden">
                    <span className="rounded-full border border-[#e29937]/35 bg-[#ea860f] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">
                      {t("common.you")}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {rows.length === 0 && (
          <div className="mt-4 rounded-[1.35rem] border border-dashed border-[#d9c8b2] bg-white/50 px-5 py-8 text-center">
            <p className="text-sm text-[#5f5147]">{t("leaderboard.empty")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
