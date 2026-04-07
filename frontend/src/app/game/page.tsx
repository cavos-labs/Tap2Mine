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
      <div className="flex flex-1 items-center justify-center p-8 text-black/40">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-[#EAE5DC] bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
          <Link
            href="/player"
            className="text-sm font-medium text-black/45 transition-colors hover:text-[#0A0908]"
          >
            ← Profile
          </Link>
          <span className="text-xs font-medium text-black/35">@{user.username}</span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-3 py-6 pb-10 sm:px-6 sm:py-10">
        <GameSession />
      </main>
    </div>
  );
}
