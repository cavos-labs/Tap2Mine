"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import type { GameRound, LeaderboardRow, User } from "@/lib/types";
import { mergeLeaderboard } from "@/lib/leaderboard";
import {
  appendHistory,
  clearUsername,
  readBestTaps,
  readHistory,
  readLocalBoard,
  readUsername,
  upsertLocalBoard,
  writeBestTapsIfBetter,
  writeUsername,
} from "@/lib/storage";

type PlayerContextValue = {
  user: User | null;
  highScoreTaps: number;
  history: GameRound[];
  leaderboard: LeaderboardRow[];
  login: (username: string) => void;
  logout: () => void;
  recordRound: (round: Omit<GameRound, "id" | "playedAt">) => void;
  refreshLocalState: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [highScoreTaps, setHighScoreTaps] = useState(0);
  const [history, setHistory] = useState<GameRound[]>([]);
  const [boardVersion, setBoardVersion] = useState(0);
  /** SSR + first client paint must match (no localStorage on server). */
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>(() =>
    mergeLeaderboard([])
  );

  const refreshLocalState = useCallback(() => {
    const name = readUsername();
    if (!name) {
      setUser(null);
      setHighScoreTaps(0);
      setHistory([]);
      return;
    }
    setUser({ username: name });
    setHighScoreTaps(readBestTaps(name));
    setHistory(readHistory(name));
  }, []);

  useEffect(() => {
    refreshLocalState();
  }, [refreshLocalState]);

  const login = useCallback(
    (username: string) => {
      const trimmed = username.trim();
      if (!trimmed) return;
      writeUsername(trimmed);
      refreshLocalState();
    },
    [refreshLocalState]
  );

  const logout = useCallback(() => {
    clearUsername();
    setUser(null);
    setHighScoreTaps(0);
    setHistory([]);
  }, []);

  const recordRound = useCallback(
    (round: Omit<GameRound, "id" | "playedAt">) => {
      const name = readUsername();
      if (!name) return;
      const full: GameRound = {
        ...round,
        id: crypto.randomUUID(),
        playedAt: Date.now(),
      };
      appendHistory(name, full);
      const best = writeBestTapsIfBetter(name, round.taps);
      upsertLocalBoard(name, best);
      setHighScoreTaps(best);
      setHistory(readHistory(name));
      setBoardVersion((v) => v + 1);
    },
    []
  );

  useEffect(() => {
    setLeaderboard(mergeLeaderboard(readLocalBoard()));
  }, [boardVersion, user?.username]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      user,
      highScoreTaps,
      history,
      leaderboard,
      login,
      logout,
      recordRound,
      refreshLocalState,
    }),
    [
      user,
      highScoreTaps,
      history,
      leaderboard,
      login,
      logout,
      recordRound,
      refreshLocalState,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
