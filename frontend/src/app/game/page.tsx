"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GameSession } from "@/components/game-session";
import { usePlayer } from "@/context/player-context";

export default function GamePage() {
  const router = useRouter();
  const { user } = usePlayer();

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-[var(--btc-border)] bg-black/40 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
          <Link
            href="/player"
            className="font-mono text-sm text-zinc-400 hover:text-[var(--btc-gold)]"
          >
            ← Profile
          </Link>
          <span className="font-mono text-xs text-zinc-600">
            @{user.username}
          </span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-3 py-6 pb-10 sm:px-6 sm:py-10">
        <GameSession />
      </main>
    </div>
  );
}
