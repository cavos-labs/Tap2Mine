"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";
import { LeaderboardPanel } from "@/components/leaderboard-panel";
import { usePlayer } from "@/context/player-context";
import { fetchBtcPriceUsd } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { user, login, leaderboard } = usePlayer();
  const [authOpen, setAuthOpen] = useState(false);
  const [btcPriceUsd, setBtcPriceUsd] = useState<number | null>(null);

  useEffect(() => {
    fetchBtcPriceUsd()
      .then((r) => setBtcPriceUsd(r.priceUsd))
      .catch(() => setBtcPriceUsd(null));
  }, [leaderboard]);

  const onStart = () => {
    if (user) router.push("/player");
    else setAuthOpen(true);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-black/[0.06] bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight"
          >
            <span className="text-[#0A0908]">Tap2</span>
            <span className="text-btc-orange">Mine</span>
          </Link>
          {user ? (
            <Link
              href="/player"
              className="text-sm font-medium text-black/45 transition-colors hover:text-[#0A0908]"
            >
              @{user.username}
            </Link>
          ) : (
            <span className="text-xs font-medium text-black/35">Guest</span>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12">
        <section className="text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/30">
            Casual mini-game
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tighter text-[#0A0908] sm:text-6xl sm:leading-[1.05]">
            Tap. <span className="text-btc-orange">Mine.</span>{" "}
            <span className="text-black/35">Repeat.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-black/45 sm:text-base">
            You have 15 seconds. Tap the button as fast as you can to collect
            Bitcoin scores! Can you become the #1 player?
          </p>
          <button
            type="button"
            onClick={onStart}
            className="cavos-btn-primary mt-8 inline-flex min-h-12 min-w-[min(100%,200px)] items-center justify-center px-8 py-3.5 text-sm sm:mt-10 sm:min-h-0 sm:px-10 sm:py-4 sm:text-base"
          >
            Start
          </button>
        </section>

        <LeaderboardPanel
          rows={leaderboard}
          highlightUsername={user?.username}
          priceUsd={btcPriceUsd}
        />
      </main>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(username) => {
          flushSync(() => {
            login(username);
          });
          router.push("/player");
        }}
      />
    </div>
  );
}
