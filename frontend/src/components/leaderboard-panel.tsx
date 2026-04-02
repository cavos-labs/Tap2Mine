import type { LeaderboardRow } from "@/lib/types";
import { formatBtc } from "@/lib/format";

type Props = {
  rows: LeaderboardRow[];
  highlightUsername?: string | null;
  /** Spot BTC/USD for imaginary value display; null if unavailable. */
  priceUsd: number | null;
};

function formatUsd(btc: number, priceUsd: number) {
  return new Intl.NumberFormat("en-US", {
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
  return (
    <section className="btc-card border border-[var(--btc-border)] p-4 sm:p-6">
      <h2 className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--btc-orange)] sm:text-sm">
        Leaderboard
      </h2>
      <p className="mb-4 text-[11px] leading-snug text-zinc-500 sm:text-xs">
        Ranked by imaginary BTC from your best 15s round. USD uses the current
        rate (approx.).
      </p>

      <div className="mb-2 hidden grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] gap-x-3 px-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500 sm:grid">
        <span>#</span>
        <span>Player</span>
        <span className="text-right">BTC</span>
        <span className="text-right">USD ~</span>
      </div>

      <ul className="space-y-2">
        {rows.map((row, i) => {
          const isYou = highlightUsername && row.username === highlightUsername;
          return (
            <li
              key={`${row.username}-${i}`}
              className={`rounded-lg px-3 py-3 font-mono text-sm sm:grid sm:grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-x-3 sm:py-2 ${
                isYou
                  ? "bg-[var(--btc-orange)]/15 ring-1 ring-[var(--btc-orange)]/40"
                  : "bg-black/30"
              }`}
            >
              <span className="mb-2 inline-block w-6 text-zinc-600 sm:mb-0">
                {i + 1}
              </span>
              <span className="mb-2 flex flex-wrap items-center gap-2 text-zinc-300 sm:mb-0">
                {row.username}
                {isYou && (
                  <span className="text-xs text-[var(--btc-orange)]">you</span>
                )}
              </span>
              <span className="mb-1 block text-right tabular-nums text-[var(--btc-gold)] sm:mb-0">
                {formatBtc(row.bestBtcMined)}
              </span>
              <span className="block text-right tabular-nums text-emerald-400/90 sm:mb-0">
                {priceUsd != null
                  ? formatUsd(row.bestBtcMined, priceUsd)
                  : "—"}
              </span>
            </li>
          );
        })}
      </ul>
      {rows.length === 0 && (
        <p className="text-sm text-zinc-500">No players yet.</p>
      )}
    </section>
  );
}
