"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BTC_PER_TAP,
  GAME_DURATION_MS,
  PHASE_LAST_10_MS,
  PHASE_LAST_5_MS,
} from "@/lib/constants";
import { formatImaginaryBtc } from "@/lib/format";
import { fetchBtcPriceUsd } from "@/lib/api";
import { usePlayer } from "@/context/player-context";

type Phase = "rules" | "playing" | "done";

export function GameSession() {
  const { recordRound } = usePlayer();
  const [phase, setPhase] = useState<Phase>("rules");
  const [leftMs, setLeftMs] = useState(GAME_DURATION_MS);
  const tapsRef = useRef(0);
  const [tapTick, setTapTick] = useState(0);
  const endAtRef = useRef(0);
  const [finalTaps, setFinalTaps] = useState(0);
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  const finish = useCallback(() => {
    const taps = tapsRef.current;
    setFinalTaps(taps);
    const btcMined = taps * BTC_PER_TAP;
    recordRound({ taps, btcMined });
    setPhase("done");
    fetchBtcPriceUsd()
      .then((r) => {
        setPriceUsd(r.priceUsd);
        setPriceError(null);
      })
      .catch(() => {
        setPriceError("Unavailable");
        setPriceUsd(null);
      });
  }, [recordRound]);

  useEffect(() => {
    if (phase !== "playing") return;
    let completed = false;
    endAtRef.current = Date.now() + GAME_DURATION_MS;
    tapsRef.current = 0;
    setTapTick(0);
    const id = window.setInterval(() => {
      const left = Math.max(0, endAtRef.current - Date.now());
      setLeftMs(left);
      if (left <= 0 && !completed) {
        completed = true;
        window.clearInterval(id);
        finish();
      }
    }, 40);
    return () => {
      completed = true;
      window.clearInterval(id);
    };
  }, [phase, finish]);

  const startPlaying = () => {
    setLeftMs(GAME_DURATION_MS);
    setPhase("playing");
  };

  const onTap = () => {
    if (phase !== "playing") return;
    tapsRef.current += 1;
    setTapTick((t) => t + 1);
  };

  const leftSec = Math.ceil(leftMs / 1000);
  const warn10 = phase === "playing" && leftMs <= PHASE_LAST_10_MS;
  const warn5 = phase === "playing" && leftMs <= PHASE_LAST_5_MS;

  const btcMined = finalTaps * BTC_PER_TAP;
  const usdApprox = priceUsd != null ? btcMined * priceUsd : null;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-2 sm:gap-8 sm:px-0">
      {phase === "rules" && (
        <section className="btc-card border border-[var(--btc-border)] p-4 sm:p-6">
          <h2 className="mb-3 font-mono text-base text-[var(--btc-orange)] sm:text-lg">
            Rules
          </h2>
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-zinc-300 sm:text-base">
            <li>You have 15 seconds to tap as fast as you can.</li>
            <li>Each tap mines 1 imaginary BTC.</li>
            <li>
              When 10 seconds or less remain, the orange pulse starts; under 5
              seconds it switches to the red pulse.
            </li>
            <li>Your best round counts on the leaderboard under your username.</li>
          </ul>
          <button
            type="button"
            className="btc-btn-primary mt-6 w-full py-3.5 font-mono text-sm font-semibold sm:mt-8 sm:py-4 sm:text-base"
            onClick={startPlaying}
          >
            Got it — start
          </button>
        </section>
      )}

      {phase === "playing" && (
        <div
          className={`relative flex flex-col items-center gap-4 px-1 transition-all duration-300 sm:gap-6 ${
            warn5
              ? "btc-pulse-critical sm:scale-[1.02]"
              : warn10
                ? "btc-pulse-warn"
                : ""
          }`}
        >
          <div className="font-mono text-3xl tabular-nums text-[var(--btc-gold)] sm:text-4xl md:text-5xl">
            00:{leftSec.toString().padStart(2, "0")}
          </div>
          {warn10 && (
            <p
              className={`font-mono text-xs uppercase tracking-widest sm:text-sm ${
                warn5 ? "text-red-400" : "text-[var(--btc-orange)]"
              }`}
            >
              {warn5 ? "Last 5s — max intensity" : "Last 10s — speed up"}
            </p>
          )}
          <button
            type="button"
            onClick={onTap}
            className={`relative flex h-[min(11rem,78vw)] w-[min(11rem,78vw)] touch-manipulation select-none items-center justify-center rounded-full border-4 font-mono text-base font-bold transition-transform active:scale-95 sm:h-44 sm:w-44 sm:text-lg ${
              warn5
                ? "border-red-500 bg-gradient-to-b from-red-900/40 to-black text-red-200 shadow-[0_0_40px_rgba(239,68,68,0.45)]"
                : warn10
                  ? "border-[var(--btc-orange)] bg-gradient-to-b from-orange-900/50 to-black text-[var(--btc-orange)] shadow-[0_0_32px_rgba(247,147,26,0.35)]"
                  : "border-[var(--btc-gold)] bg-gradient-to-b from-amber-900/30 to-black text-[var(--btc-gold)] shadow-[0_0_24px_rgba(245,158,11,0.25)]"
            }`}
          >
            TAP
            <span className="absolute bottom-[18%] max-w-[90%] truncate px-1 text-[10px] font-normal opacity-80 sm:bottom-6 sm:text-xs">
              {tapTick} BTC
            </span>
          </button>
        </div>
      )}

      {phase === "done" && (
        <section className="btc-card border border-[var(--btc-border)] p-4 text-center sm:p-6">
          <h2 className="font-mono text-base text-[var(--btc-orange)] sm:text-lg">
            Round over
          </h2>
          <p className="mt-2 font-mono text-2xl tabular-nums text-white sm:text-3xl">
            {finalTaps.toLocaleString("en-US")} taps
          </p>
          <p className="mt-3 font-mono text-sm text-zinc-400">Imaginary BTC</p>
          <p className="font-mono text-xl tabular-nums text-[var(--btc-gold)] sm:text-2xl">
            {formatImaginaryBtc(btcMined)}
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500 sm:text-xs">
            Approx. USD value
          </p>
          {priceUsd != null && usdApprox != null && (
            <p className="font-mono text-lg tabular-nums text-emerald-400 sm:text-xl">
              ≈{" "}
              {usdApprox.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              })}
            </p>
          )}
          {priceError && (
            <p className="text-sm text-zinc-500">{priceError}</p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center">
            <button
              type="button"
              className="btc-btn-primary px-6 py-3 font-mono text-sm font-semibold"
              onClick={() => {
                setPhase("rules");
                setPriceUsd(null);
                setPriceError(null);
              }}
            >
              Play again
            </button>
            <Link
              href="/player"
              className="btc-btn-secondary inline-flex min-h-11 items-center justify-center px-6 py-3 font-mono text-sm"
            >
              Back to profile
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
