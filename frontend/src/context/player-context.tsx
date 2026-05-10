"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useCavos } from "@cavos/react";
import type { GameRound, LeaderboardRow, User } from "@/lib/types";
import {
  appendHistory,
  readBestTaps,
  readHistory,
  readUsername,
  writeBestTapsIfBetter,
  writeUsername,
} from "@/lib/storage";
import {
  fetchOnchainLeaderboard,
  fetchOnchainPlayer,
  tap2MineProvider,
  TAP2MINE_CONTRACT_ADDRESS,
  usernameCalldata,
} from "@/lib/onchain";

type PlayerContextValue = {
  user: User | null;
  walletAddress: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileCheckedAddress: string | null;
  walletStatus: ReturnType<typeof useCavos>["walletStatus"];
  highScoreTaps: number;
  history: GameRound[];
  leaderboard: LeaderboardRow[];
  openWalletModal: () => void;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  recordRound: (round: Omit<GameRound, "id" | "playedAt" | "txHash">) => Promise<string>;
  refreshLocalState: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const {
    address,
    execute,
    isAuthenticated,
    isLoading,
    logout: cavosLogout,
    openModal,
    walletStatus,
  } = useCavos();
  const [user, setUser] = useState<User | null>(null);
  const [highScoreTaps, setHighScoreTaps] = useState(0);
  const [history, setHistory] = useState<GameRound[]>([]);
  const [boardVersion, setBoardVersion] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [profileCheckedAddress, setProfileCheckedAddress] = useState<string | null>(null);

  const refreshLocalState = useCallback(async () => {
    if (!address || !isAuthenticated) {
      setUser(null);
      setHighScoreTaps(0);
      setHistory([]);
      setProfileCheckedAddress(null);
      return;
    }

    const player = await fetchOnchainPlayer(address);
    setProfileCheckedAddress(address);
    const storedName = readUsername();
    const username = player?.username || storedName;
    if (!username) {
      setUser(null);
      setHighScoreTaps(0);
      setHistory([]);
      return;
    }

    writeUsername(username);
    setUser({ username, address });
    setHighScoreTaps(player?.bestTaps ?? readBestTaps(username));
    setHistory(readHistory(username));
  }, [address, isAuthenticated]);

  useEffect(() => {
    void refreshLocalState();
  }, [refreshLocalState, boardVersion]);

  const login = useCallback(
    async (username: string) => {
      const trimmed = username.trim();
      if (!trimmed) return;
      if (!address) throw new Error("Wallet not connected");
      await execute({
        contractAddress: TAP2MINE_CONTRACT_ADDRESS,
        entrypoint: "register_username",
        calldata: usernameCalldata(trimmed),
      }).then((txHash) => tap2MineProvider.waitForTransaction(txHash).catch(() => undefined));
      writeUsername(trimmed);
      await refreshLocalState();
      setBoardVersion((v) => v + 1);
    },
    [address, execute, refreshLocalState],
  );

  const logout = useCallback(async () => {
    await cavosLogout();
    setUser(null);
    setHighScoreTaps(0);
    setHistory([]);
  }, [cavosLogout]);

  const recordRound = useCallback(
    async (round: Omit<GameRound, "id" | "playedAt" | "txHash">) => {
      const name = user?.username ?? readUsername();
      if (!name) throw new Error("Username required");
      const txHash = await execute({
        contractAddress: TAP2MINE_CONTRACT_ADDRESS,
        entrypoint: "submit_round",
        calldata: [round.taps],
      });
      try {
        await tap2MineProvider.waitForTransaction(txHash);
      } catch {
        // The tx hash is still useful even if polling times out or the RPC is busy.
      }
      const full: GameRound = {
        ...round,
        txHash,
        id: crypto.randomUUID(),
        playedAt: Date.now(),
      };
      appendHistory(name, full);
      const best = writeBestTapsIfBetter(name, round.taps);
      setHighScoreTaps(best);
      setHistory(readHistory(name));
      setBoardVersion((v) => v + 1);
      return txHash;
    },
    [execute, user?.username],
  );

  useEffect(() => {
    let cancelled = false;
    fetchOnchainLeaderboard()
      .then((rows) => {
        if (!cancelled) setLeaderboard(rows);
      })
      .catch(() => {
        if (!cancelled) setLeaderboard([]);
      });
    return () => {
      cancelled = true;
    };
  }, [boardVersion, user?.username]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      user,
      walletAddress: address,
      isAuthenticated,
      isLoading,
      profileCheckedAddress,
      walletStatus,
      highScoreTaps,
      history,
      leaderboard,
      openWalletModal: openModal,
      login,
      logout,
      recordRound,
      refreshLocalState,
    }),
    [
      user,
      address,
      isAuthenticated,
      isLoading,
      profileCheckedAddress,
      walletStatus,
      highScoreTaps,
      history,
      leaderboard,
      openModal,
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
