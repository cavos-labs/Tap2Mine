import { BTC_PER_TAP } from "./constants";
import type { LeaderboardRow, LeaderboardStoredEntry } from "./types";

/** Mock tap counts; BTC is derived with BTC_PER_TAP. */
export const MOCK_LEADERBOARD: LeaderboardStoredEntry[] = [
  { username: "satoshi_fan", bestTaps: 312 },
  { username: "hash_queen", bestTaps: 298 },
  { username: "block_runner", bestTaps: 276 },
  { username: "mempool_", bestTaps: 251 },
  { username: "tap_master", bestTaps: 239 },
];

function rowFromTaps(username: string, bestTaps: number): LeaderboardRow {
  return {
    username,
    bestTaps,
    bestBtcMined: bestTaps * BTC_PER_TAP,
  };
}

/**
 * Merges mock + local best tap counts, ranks by imaginary BTC mined (same order as taps).
 */
export function mergeLeaderboard(
  local: LeaderboardStoredEntry[],
  limit = 8
): LeaderboardRow[] {
  const byUser = new Map<string, number>();
  for (const row of MOCK_LEADERBOARD) {
    byUser.set(row.username, row.bestTaps);
  }
  for (const row of local) {
    const prev = byUser.get(row.username) ?? 0;
    if (row.bestTaps > prev) byUser.set(row.username, row.bestTaps);
  }
  return [...byUser.entries()]
    .map(([username, bestTaps]) => rowFromTaps(username, bestTaps))
    .sort((a, b) => b.bestBtcMined - a.bestBtcMined)
    .slice(0, limit);
}
