"use client";

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
    maximumFractionDigits: 0,
  }).format(btc * priceUsd);
}

function rankAccent(rank: number): string {
  if (rank === 1) return "text-[#b45309]";
  if (rank === 2) return "text-[#475569]";
  if (rank === 3) return "text-[#9a3412]";
  return "text-[var(--cavos-subtle)]";
}

export function LeaderboardPanel({
  rows,
  highlightUsername,
  priceUsd,
}: Props) {
  const { t, intlLocale } = useI18n();

  return (
    <section className="card relative overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-2.5 border-b border-[var(--cavos-border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">{t("leaderboard.eyebrow")}</span>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#120c08] sm:text-2xl">
            {t("leaderboard.title")}
          </h2>
          <p className="mt-1 max-w-md text-[13px] leading-5 text-[var(--cavos-muted)] sm:text-sm">
            {t("leaderboard.subtitle")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-[var(--cavos-border)] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6c4b2e] sm:text-[11px]">
          <span
            className={`inline-flex h-2 w-2 rounded-full ${
              priceUsd != null ? "bg-[#14b86a]" : "bg-[var(--cavos-subtle)]"
            }`}
          />
          {priceUsd != null ? t("leaderboard.live") : t("leaderboard.offline")}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 rounded-[1rem] border border-dashed border-[var(--cavos-border-strong)] bg-[var(--cavos-surface-quiet)] px-5 py-8 text-center">
          <p className="text-sm text-[var(--cavos-muted)]">
            {t("leaderboard.empty")}
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--cavos-border)]">
          {rows.map((row, i) => {
            const rank = i + 1;
            const isYou =
              highlightUsername && row.username === highlightUsername;
            const isPodium = rank <= 3;

            return (
              <li
                key={`${row.username}-${i}`}
                className={`flex items-center gap-3 py-3 transition-colors sm:gap-4 sm:py-3.5 ${
                  isYou ? "bg-[var(--btc-orange-soft)]" : ""
                } ${isYou ? "rounded-[0.85rem] px-3 sm:px-4" : ""}`}
              >
                <span
                  className={`w-7 shrink-0 text-right font-[family:var(--font-romagothicbold)] text-base tabular-nums tracking-tight sm:text-lg ${rankAccent(
                    rank,
                  )}`}
                >
                  {rank}
                </span>

                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-[14px] font-semibold text-[#120c08] sm:text-[15px]">
                    {row.username}
                  </span>
                  {isYou && (
                    <span className="rounded-full bg-[var(--btc-btn-solid)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                      {t("common.you")}
                    </span>
                  )}
                  {isPodium && (
                    <span className="text-sm" aria-hidden>
                      ☕
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
                  <span className="text-sm font-semibold tabular-nums text-[#120c08] sm:text-[15px]">
                    {formatBtc(row.bestBtcMined, intlLocale)}
                  </span>
                  {priceUsd != null ? (
                    <span className="text-[11px] font-semibold tabular-nums text-[#059669] sm:text-xs">
                      ≈ {formatUsd(row.bestBtcMined, priceUsd, intlLocale)}
                    </span>
                  ) : (
                    <span className="text-[11px] tabular-nums text-[var(--cavos-subtle)] sm:text-xs">
                      USD —
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
