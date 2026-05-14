import { CallData, RpcProvider, byteArray, num } from "starknet";
import type { LeaderboardRow, OnchainPlayer } from "./types";

export const TAP2MINE_CONTRACT_ADDRESS =
  "0x06452f3c45f0213f71619a339baaab4705b284613bc39cd190faa07d2a4ab99d";

export const TAP2MINE_CLASS_HASH =
  "0x68343ddb2a9a1c7941f7868e1a3f7212e2dd53dc7a4efd62fa25f17d5d2ce17";

export const STARKNET_SEPOLIA_RPC_URL =
  "https://starknet-sepolia-rpc.publicnode.com/";

export const CAVOS_APP_ID = "32e2133b-d16f-4926-bb8b-48d27efdc8a1";

export const tap2MineProvider = new RpcProvider({
  nodeUrl: STARKNET_SEPOLIA_RPC_URL,
});

type ByteArrayParts = {
  data: string[];
  pending_word: string;
  pending_word_len: number;
};

function asNumber(value: string | bigint | number | undefined): number {
  if (value == null) return 0;
  return Number(BigInt(value));
}

function readByteArray(values: string[], offset: number) {
  const dataLen = asNumber(values[offset]);
  const data = values.slice(offset + 1, offset + 1 + dataLen);
  const pendingWord = values[offset + 1 + dataLen] ?? "0x0";
  const pendingWordLen = asNumber(values[offset + 2 + dataLen]);
  const next = offset + 3 + dataLen;
  const parts: ByteArrayParts = {
    data,
    pending_word: pendingWord,
    pending_word_len: pendingWordLen,
  };
  return {
    value: byteArray.stringFromByteArray(parts),
    next,
  };
}

function normalizeAddress(value: string) {
  return num.toHex(BigInt(value));
}

export function usernameCalldata(username: string) {
  return CallData.compile([byteArray.byteArrayFromString(username)]);
}

export function addressCalldata(address: string) {
  return CallData.compile([address]);
}

export async function fetchOnchainPlayer(
  address: string | null | undefined,
): Promise<OnchainPlayer | null> {
  if (!address) return null;
  const result = await tap2MineProvider.callContract({
    contractAddress: TAP2MINE_CONTRACT_ADDRESS,
    entrypoint: "get_player",
    calldata: addressCalldata(address),
  });
  const raw = Array.from(result);
  const username = readByteArray(raw, 0);
  return {
    address: normalizeAddress(address),
    username: username.value,
    bestTaps: asNumber(raw[username.next]),
    roundsPlayed: asNumber(raw[username.next + 1]),
    lastPlayedAt: asNumber(raw[username.next + 2]),
  };
}

export async function fetchOnchainLeaderboard(): Promise<LeaderboardRow[]> {
  const result = await tap2MineProvider.callContract({
    contractAddress: TAP2MINE_CONTRACT_ADDRESS,
    entrypoint: "get_leaderboard",
    calldata: [],
  });
  const raw = Array.from(result);
  const count = asNumber(raw[0]);
  const rows: LeaderboardRow[] = [];
  let offset = 1;
  for (let i = 0; i < count; i += 1) {
    const player = normalizeAddress(raw[offset] ?? "0x0");
    offset += 1;
    const username = readByteArray(raw, offset);
    offset = username.next;
    const bestTaps = asNumber(raw[offset]);
    offset += 1;
    rows.push({
      address: player,
      username: username.value,
      bestTaps,
      bestBtcMined: bestTaps,
    });
  }
  return rows;
}
