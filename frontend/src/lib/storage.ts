import type { GameRound, LeaderboardStoredEntry } from "./types";

const KEY_USER = "tap2mine_user";
const KEY_BEST = "tap2mine_best_taps";
const KEY_HISTORY = "tap2mine_history";
const KEY_BOARD = "tap2mine_leaderboard_entries";
const KEY_REGISTRY = "tap2mine_registered_users";

function ls(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function readUsername(): string | null {
  const storage = ls();
  if (!storage) return null;
  try {
    const raw = storage.getItem(KEY_USER);
    if (!raw) return null;
    const u = JSON.parse(raw) as { username?: string };
    return typeof u.username === "string" ? u.username : null;
  } catch {
    return null;
  }
}

export function writeUsername(username: string) {
  const storage = ls();
  if (!storage) return;
  storage.setItem(KEY_USER, JSON.stringify({ username }));
}

export function clearUsername() {
  const storage = ls();
  if (!storage) return;
  storage.removeItem(KEY_USER);
}

function normalizeUsernameKey(name: string): string {
  return name.trim().toLowerCase();
}

function readRegistryUsernames(): string[] {
  const storage = ls();
  if (!storage) return [];
  try {
    const raw = storage.getItem(KEY_REGISTRY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

/** If this handle exists (case-insensitive), return the stored spelling. */
export function resolveRegisteredUsername(input: string): string | null {
  const key = normalizeUsernameKey(input);
  for (const u of readRegistryUsernames()) {
    if (normalizeUsernameKey(u) === key) return u;
  }
  return null;
}

/**
 * Adds username to the local registry if that handle is not already stored
 * (case-insensitive). Returns true if it was new, false if it already existed.
 */
export function registerUsernameIfNew(username: string): boolean {
  const storage = ls();
  if (!storage) return true;
  const trimmed = username.trim();
  if (!trimmed) return false;
  const key = normalizeUsernameKey(trimmed);
  const list = readRegistryUsernames();
  if (list.some((u) => normalizeUsernameKey(u) === key)) {
    return false;
  }
  list.push(trimmed);
  storage.setItem(KEY_REGISTRY, JSON.stringify(list));
  return true;
}

export function readBestTaps(username: string): number {
  const storage = ls();
  if (!storage) return 0;
  try {
    const map = JSON.parse(
      storage.getItem(KEY_BEST) || "{}"
    ) as Record<string, number>;
    const v = map[username];
    return typeof v === "number" && Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
}

export function writeBestTapsIfBetter(username: string, taps: number) {
  const storage = ls();
  if (!storage) return taps;
  const prev = readBestTaps(username);
  if (taps <= prev) return prev;
  const map = JSON.parse(
    storage.getItem(KEY_BEST) || "{}"
  ) as Record<string, number>;
  map[username] = taps;
  storage.setItem(KEY_BEST, JSON.stringify(map));
  return taps;
}

export function readHistory(username: string): GameRound[] {
  const storage = ls();
  if (!storage) return [];
  try {
    const map = JSON.parse(
      storage.getItem(KEY_HISTORY) || "{}"
    ) as Record<string, GameRound[]>;
    const list = map[username];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function appendHistory(username: string, round: GameRound) {
  const storage = ls();
  if (!storage) return;
  const map = JSON.parse(
    storage.getItem(KEY_HISTORY) || "{}"
  ) as Record<string, GameRound[]>;
  const list = Array.isArray(map[username]) ? map[username] : [];
  map[username] = [round, ...list].slice(0, 50);
  storage.setItem(KEY_HISTORY, JSON.stringify(map));
}

function parseStoredBoardRow(raw: unknown): LeaderboardStoredEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.username !== "string" || typeof o.bestTaps !== "number") {
    return null;
  }
  return { username: o.username, bestTaps: o.bestTaps };
}

export function readLocalBoard(): LeaderboardStoredEntry[] {
  const storage = ls();
  if (!storage) return [];
  try {
    const raw = storage.getItem(KEY_BOARD);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseStoredBoardRow)
      .filter((r): r is LeaderboardStoredEntry => r != null);
  } catch {
    return [];
  }
}

export function upsertLocalBoard(username: string, bestTaps: number) {
  const storage = ls();
  if (!storage) return;
  const rows = readLocalBoard().filter((r) => r.username !== username);
  rows.push({ username, bestTaps });
  rows.sort((a, b) => b.bestTaps - a.bestTaps);
  storage.setItem(KEY_BOARD, JSON.stringify(rows.slice(0, 20)));
}
