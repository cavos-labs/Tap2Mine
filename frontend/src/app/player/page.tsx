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
      <div className="flex flex-1 items-center justify-center p-8 text-black/40">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-[#EAE5DC] bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-black/45 transition-colors hover:text-[#0A0908]"
          >
            ← Home
          </Link>
          <span className="text-sm font-semibold text-[#0A0908]">
            @{user.username}
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10">
        <section className="cavos-card p-4 sm:p-6">
          <h1 className="text-lg font-bold text-[#0A0908] sm:text-xl">
            Your profile
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-black/45">
            Best 15s round on this device (1 BTC per tap).
          </p>
          <p className="mt-4 text-2xl font-semibold tabular-nums tracking-tight text-[#0A0908] sm:text-4xl">
            {formatImaginaryBtc(highScoreTaps)}
          </p>
          <p className="mt-1 text-xs tabular-nums text-black/35">
            {highScoreTaps.toLocaleString("en-US")} taps
          </p>
          <Link
            href="/game"
            className="cavos-btn-primary mt-8 inline-flex items-center justify-center px-8 py-3 text-sm font-semibold"
          >
            New game
          </Link>
        </section>

        <section className="cavos-card p-4 sm:p-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/35">
            Recent games
          </h2>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-black/40">
              No games yet. Start a round!
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {history.slice(0, 12).map((g) => (
                <li
                  key={g.id}
                  className="flex flex-col gap-1 rounded-xl border border-black/[0.05] bg-[#F7F5F2]/80 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm"
                >
                  <span className="shrink-0 text-black/40">
                    {new Date(g.playedAt).toLocaleString("en-US", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                  <span className="break-all text-right tabular-nums font-medium text-[#0A0908] sm:break-normal">
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
          className="cavos-btn-secondary py-3 text-sm"
        >
          Log out
        </button>
      </main>
    </div>
  );
}
