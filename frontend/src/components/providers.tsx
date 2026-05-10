"use client";

import { CavosProvider } from "@cavos/react";
import { LocaleProvider } from "@/context/locale-context";
import { PlayerProvider } from "@/context/player-context";
import {
  CAVOS_APP_ID,
  STARKNET_SEPOLIA_RPC_URL,
  TAP2MINE_CONTRACT_ADDRESS,
} from "@/lib/onchain";

const sessionPolicy = {
  allowedContracts: [TAP2MINE_CONTRACT_ADDRESS],
  spendingLimits: [],
  maxCallsPerTx: 1,
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <CavosProvider
        config={{
          appId: CAVOS_APP_ID,
          network: "sepolia",
          starknetRpcUrl: STARKNET_SEPOLIA_RPC_URL,
          paymasterApiKey: "cav_PvUDiaazPP-toREEa-7gAPOYKDVODcSoCTa3IRsAqsC6ZjyQ",
          paymasterUrl: "https://sepolia-paymaster.cavos.xyz",
          session: { defaultPolicy: sessionPolicy },
        }}
        modal={{
          appName: "Tap2Mine",
          appLogo: "/cavos-black.png",
          providers: ["google", "apple", "email"],
          emailMode: "otp",
          primaryColor: "#f7931a",
          theme: "light",
        }}
      >
        <PlayerProvider>{children}</PlayerProvider>
      </CavosProvider>
    </LocaleProvider>
  );
}
