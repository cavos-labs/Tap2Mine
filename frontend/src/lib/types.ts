export type User = {
  username: string;
  address?: string;
};

/** Persisted locally (taps only; BTC is derived with BTC_PER_TAP). */
export type LeaderboardStoredEntry = {
  username: string;
  bestTaps: number;
};

export type LeaderboardRow = {
  address?: string;
  username: string;
  /** Best tap count in a single round. */
  bestTaps: number;
  /** Imaginary BTC from best round: bestTaps × BTC_PER_TAP. */
  bestBtcMined: number;
};

export type GameRound = {
  id: string;
  playedAt: number;
  taps: number;
  btcMined: number;
  txHash?: string;
};

export type OnchainPlayer = {
  address: string;
  username: string;
  bestTaps: number;
  roundsPlayed: number;
  lastPlayedAt: number;
};
