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
    <section className="cavos-card p-4 sm:p-6">
      <h2 className="mb-1 text-sm font-semibold tracking-wide text-[#0A0908]">
        Leaderboard
      </h2>
      <p className="mb-4 text-[11px] leading-snug text-black/40 sm:text-xs">
        Top players with the highest score from a 15-second game.
      </p>

      <div className="mb-2 hidden grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] gap-x-3 border-b border-black/[0.06] pb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-black/35 sm:grid">
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
              className={`border-b border-black/[0.05] px-3 py-3 text-sm font-medium last:border-0 sm:grid sm:grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-x-3 sm:py-3 ${
                isYou
                  ? "rounded-xl bg-[#F7F5F2]"
                  : "hover:bg-black/[0.02]"
              }`}
            >
              <span className="mb-2 inline-block w-6 tabular-nums text-black/35 sm:mb-0">
                {i + 1}
              </span>
              <span className="mb-2 flex flex-wrap items-center gap-2 text-black sm:mb-0">
                {row.username}
                {isYou && (
                  <span className="rounded-md bg-[#ea860f] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    you
                  </span>
                )}
              </span>
              <span className="mb-1 block text-right tabular-nums font-semibold text-[#0A0908] sm:mb-0">
                {formatBtc(row.bestBtcMined)}
              </span>
              <span className="block text-right tabular-nums text-black/40 sm:mb-0">
                {priceUsd != null
                  ? formatUsd(row.bestBtcMined, priceUsd)
                  : "—"}
              </span>
            </li>
          );
        })}
      </ul>
      {rows.length === 0 && (
        <p className="text-sm text-black/40">No players yet.</p>
      )}
    </section>
  );
}
