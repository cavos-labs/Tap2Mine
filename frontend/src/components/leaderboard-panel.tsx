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
  if (rank === 1) return "text-[var(--btc-gold)]";
  if (rank === 2) return "text-[#d9e2ec]";
  if (rank === 3) return "text-[#d98b52]";
  return "text-[var(--cavos-subtle)]";
}

export function LeaderboardPanel({
  rows,
  highlightUsername,
  priceUsd,
}: Props) {
  const { t, intlLocale } = useI18n();

  return (
    <section className="card panel-rise relative overflow-hidden p-4 sm:p-6">
      <div className="flex flex-col gap-2.5 border-b border-[var(--cavos-border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">{t("leaderboard.eyebrow")}</span>
          <h2 className="mt-2 text-xl font-extrabold text-[var(--cavos-cream)] sm:text-2xl">
            {t("leaderboard.title")}
          </h2>
          <p className="mt-1 max-w-md text-[13px] leading-5 text-[var(--cavos-muted)] sm:text-sm">
            {t("leaderboard.subtitle")}
          </p>
        </div>
        <div className="flex min-h-8 shrink-0 items-center gap-2 self-start rounded-full border border-[var(--cavos-border)] bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cavos-muted)] sm:text-[11px]">
          <span
            className={`inline-flex h-2 w-2 rounded-full ${
              priceUsd != null ? "bg-cavos-green" : "bg-cavos-subtle"
            }`}
          />
          {priceUsd != null ? t("leaderboard.live") : t("leaderboard.offline")}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 rounded-[0.85rem] border border-dashed border-[var(--cavos-border-strong)] bg-black/14 px-5 py-8 text-center">
          <p className="text-sm text-[var(--cavos-muted)]">
            {t("leaderboard.empty")}
          </p>
        </div>
      ) : (
        <ul className="mt-3 grid gap-2">
          {rows.map((row, i) => {
            const rank = i + 1;
            const isYou =
              highlightUsername && row.username === highlightUsername;
            const isPodium = rank <= 3;

            return (
              <li
                key={`${row.username}-${i}`}
                className={`tap-card flex min-h-[4.35rem] items-center gap-3 px-3 py-3 transition-transform duration-200 hover:-translate-y-0.5 sm:gap-4 sm:px-4 ${
                  isYou ? "bg-btc-soft border-[var(--cavos-border-strong)]" : ""
                }`}
              >
                <span
                  className={`w-8 shrink-0 text-center font-[family:var(--font-romagothicbold)] text-2xl tabular-nums sm:text-3xl ${rankAccent(
                    rank,
                  )}`}
                >
                  {rank}
                </span>

                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-[14px] font-bold text-[var(--cavos-cream)] sm:text-[15px]">
                    {row.username}
                  </span>
                  {isYou && (
                    <span className="bg-btc-solid rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#140b07]">
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
                  <span className="text-sm font-bold tabular-nums text-[var(--cavos-cream)] sm:text-[15px]">
                    {formatBtc(row.bestBtcMined, intlLocale)}
                  </span>
                  {priceUsd != null ? (
                    <span className="text-[11px] font-bold tabular-nums text-[var(--cavos-green)] sm:text-xs">
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
