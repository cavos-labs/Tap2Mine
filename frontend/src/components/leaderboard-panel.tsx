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
      <h2 className="mb-1 font-sans text-sm font-medium tracking-wide text-white">
        Leaderboard
      </h2>
      <p className="mb-4 text-[11px] leading-snug text-zinc-500 sm:text-xs">
        Top players with the highest score from a 15-second game.
      </p>

      <div className="mb-2 hidden grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] gap-x-3 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600 sm:grid border-b border-white/5 pb-2">
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
              className={`border-b border-white/5 last:border-0 px-3 py-3 font-mono text-sm sm:grid sm:grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-x-3 sm:py-3 ${
                isYou
                  ? "bg-white/5"
                  : "hover:bg-white/[0.02]"
              }`}
            >
              <span className="mb-2 inline-block w-6 text-zinc-600 sm:mb-0">
                {i + 1}
              </span>
              <span className="mb-2 flex flex-wrap items-center gap-2 text-zinc-300 sm:mb-0">
                {row.username}
                {isYou && (
                  <span className="rounded-sm bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">you</span>
                )}
              </span>
              <span className="mb-1 block text-right tabular-nums font-medium text-[var(--btc-orange)] sm:mb-0">
                {formatBtc(row.bestBtcMined)}
              </span>
              <span className="block text-right tabular-nums text-zinc-500 sm:mb-0">
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
