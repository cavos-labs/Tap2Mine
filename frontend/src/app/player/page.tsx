"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/context/player-context";
import { formatImaginaryBtc } from "@/lib/format";

export default function PlayerPage() {
  const router = useRouter();
  const { user, highScoreTaps, history, logout } = usePlayer();

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
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link
            href="/"
            className="font-mono text-sm text-zinc-400 hover:text-[var(--btc-gold)]"
          >
            ← Home
          </Link>
          <span className="font-mono text-[var(--btc-orange)]">
            @{user.username}
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10">
        <section className="btc-card border border-[var(--btc-border)] p-4 sm:p-6">
          <h1 className="font-mono text-lg text-white sm:text-xl">Your profile</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Best 15s round on this device (1 BTC per tap).
          </p>
          <p className="mt-4 font-mono text-2xl tabular-nums text-[var(--btc-gold)] sm:text-4xl">
            {formatImaginaryBtc(highScoreTaps)}
          </p>
          <p className="mt-1 font-mono text-xs text-zinc-500">
            {highScoreTaps.toLocaleString("en-US")} taps
          </p>
          <Link
            href="/game"
            className="btc-btn-primary mt-8 inline-flex items-center justify-center px-8 py-3 font-mono text-sm font-semibold"
          >
            New game
          </Link>
        </section>

        <section className="btc-card border border-[var(--btc-border)] p-4 sm:p-6">
          <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-[var(--btc-orange)]">
            Recent games
          </h2>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              No games yet. Start a round!
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {history.slice(0, 12).map((g) => (
                <li
                  key={g.id}
                  className="flex flex-col gap-1 rounded-lg bg-black/30 px-3 py-2 font-mono text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm"
                >
                  <span className="shrink-0 text-zinc-400">
                    {new Date(g.playedAt).toLocaleString("en-US", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                  <span className="break-all text-right tabular-nums text-[var(--btc-gold)] sm:break-normal">
                    {g.taps.toLocaleString("en-US")} taps ·{" "}
                    {formatImaginaryBtc(g.btcMined)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="btc-btn-secondary py-3 font-mono text-sm"
        >
          Log out
        </button>
      </main>
    </div>
  );
}
