"use client";

import { LocaleProvider } from "@/context/locale-context";
import { PlayerProvider } from "@/context/player-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <PlayerProvider>{children}</PlayerProvider>
    </LocaleProvider>
  );
}
