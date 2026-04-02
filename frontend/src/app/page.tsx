"use client";

import { useEffect, useState } from "react";
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
      <header className="border-b border-[var(--btc-border)] bg-black/40 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link
            href="/"
            className="font-mono text-lg tracking-tight text-[var(--btc-orange)]"
          >
            Tap2Mine
          </Link>
          {user ? (
            <Link
              href="/player"
              className="font-mono text-sm text-zinc-400 hover:text-[var(--btc-gold)]"
            >
              @{user.username}
            </Link>
          ) : (
            <span className="font-mono text-xs text-zinc-600">Guest</span>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12">
        <section className="text-center">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.35em] text-[var(--btc-orange)]">
            Bitcoin-inspired
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Tap. Mine. Repeat.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm text-zinc-400 sm:text-base">
            15 seconds, one button, 1 BTC per tap (imaginary). Your username on
            the leaderboard. Wire up real auth when you are ready.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="btc-btn-primary mt-8 inline-flex min-h-12 min-w-[min(100%,200px)] items-center justify-center px-8 py-3.5 font-mono text-base font-bold sm:mt-10 sm:min-h-0 sm:px-10 sm:py-4"
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
          login(username);
          router.push("/player");
        }}
      />
    </div>
  );
}
