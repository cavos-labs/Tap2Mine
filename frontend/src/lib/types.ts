export type User = {
  username: string;
};

/** Persisted locally (taps only; BTC is derived with BTC_PER_TAP). */
export type LeaderboardStoredEntry = {
  username: string;
  bestTaps: number;
};

export type LeaderboardRow = {
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
};
