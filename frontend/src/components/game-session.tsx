"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BTC_PER_TAP,
  GAME_DURATION_MS,
  PHASE_LAST_10_MS,
  PHASE_LAST_5_MS,
} from "@/lib/constants";
import { formatImaginaryBtc, formatUsdApprox } from "@/lib/format";
import { fetchBtcPriceUsd } from "@/lib/api";
import { usePlayer } from "@/context/player-context";

type Phase = "rules" | "playing" | "done";

export function GameSession() {
  const router = useRouter();
  const { recordRound } = usePlayer();
  const [phase, setPhase] = useState<Phase>("rules");
  const [leftMs, setLeftMs] = useState(GAME_DURATION_MS);
  const tapsRef = useRef(0);
  const [tapTick, setTapTick] = useState(0);
  const endAtRef = useRef(0);
  const [finalTaps, setFinalTaps] = useState(0);
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  /** Spot BTC/USD for live tally during the round (from backend). */
  const [spotPriceUsd, setSpotPriceUsd] = useState<number | null>(null);
  const [spotPriceLoading, setSpotPriceLoading] = useState(true);
  const [spotPriceError, setSpotPriceError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSpotPriceLoading(true);
    setSpotPriceError(false);
    fetchBtcPriceUsd()
      .then((r) => {
        if (!cancelled) {
          setSpotPriceUsd(r.priceUsd);
          setSpotPriceError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSpotPriceUsd(null);
          setSpotPriceError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setSpotPriceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    tapsRef.current = 0;
    setTapTick(0);
    setLeftMs(GAME_DURATION_MS);
    setPhase("playing");
    // Fresh price for this round (non-blocking; live tally uses spot when ready).
    fetchBtcPriceUsd()
      .then((r) => {
        setSpotPriceUsd(r.priceUsd);
        setSpotPriceError(false);
      })
      .catch(() => setSpotPriceError(true));
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

  const liveUsdMined =
    phase === "playing" && spotPriceUsd != null
      ? tapTick * BTC_PER_TAP * spotPriceUsd
      : null;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-2 sm:gap-8 sm:px-0">
      {phase === "rules" && (
        <section className="cavos-card p-4 sm:p-6">
          <h2 className="mb-3 text-base font-bold text-[#0A0908] sm:text-lg">
            Rules
          </h2>
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-black/55 sm:text-base">
            <li>You have 15 seconds to tap as fast as you can.</li>
            <li>Each tap mines 1 imaginary BTC.</li>
            <li>
              When 10 seconds or less remain, a soft pulse starts; under 5 seconds
              it intensifies.
            </li>
            <li>Your best round counts on the leaderboard under your username.</li>
          </ul>
          <button
            type="button"
            className="cavos-btn-primary mt-6 w-full py-3.5 text-sm font-semibold sm:mt-8 sm:py-4 sm:text-base"
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
              ? "cavos-pulse-critical sm:scale-[1.02]"
              : warn10
                ? "cavos-pulse-warn"
                : ""
          }`}
        >
          <div className="text-3xl font-semibold tabular-nums tracking-tight text-[#0A0908] sm:text-4xl md:text-5xl">
            00:{leftSec.toString().padStart(2, "0")}
          </div>
          {spotPriceLoading && spotPriceUsd == null && (
            <p className="text-[11px] text-black/40">Loading BTC price…</p>
          )}
          {!spotPriceLoading && spotPriceUsd == null && spotPriceError && (
            <p className="text-[11px] text-black/40">USD estimate unavailable</p>
          )}
          {liveUsdMined != null && (
            <p
              className="max-w-[min(100%,20rem)] text-center text-2xl font-bold tabular-nums tracking-tight text-emerald-700 drop-shadow-sm sm:text-3xl md:text-4xl"
              aria-live="polite"
              aria-atomic="true"
            >
              ≈ {formatUsdApprox(liveUsdMined)}
            </p>
          )}
          {warn10 && (
            <p
              className={`text-xs font-semibold uppercase tracking-widest sm:text-sm ${
                warn5 ? "text-red-700" : "text-black/45"
              }`}
            >
              {warn5 ? "Last 5s — max intensity" : "Last 10s — speed up"}
            </p>
          )}
          <button
            type="button"
            onClick={onTap}
            className={`relative flex h-[min(11rem,78vw)] w-[min(11rem,78vw)] touch-manipulation select-none items-center justify-center rounded-full border-4 font-bold transition-transform active:scale-95 sm:h-44 sm:w-44 sm:text-lg ${
              warn5
                ? "border-red-600 bg-red-50 text-red-900 shadow-[0_0_36px_rgba(220,38,38,0.2)]"
                : warn10
                  ? "border-btc-orange bg-amber-100 text-[#0A0908] shadow-[0_0_32px_rgba(247,147,26,0.35)]"
                  : "border-[#ea860f] bg-[#fff7ed] text-[#0A0908] shadow-[0_8px_32px_rgba(234,134,15,0.28)]"
            }`}
          >
            TAP
            <span className="absolute bottom-[18%] max-w-[90%] truncate px-1 text-[10px] font-semibold tabular-nums text-black/45 sm:bottom-6 sm:text-xs">
              {tapTick} BTC
            </span>
          </button>
        </div>
      )}

      {phase === "done" && (
        <section className="cavos-card p-4 text-center sm:p-6">
          <h2 className="text-base font-bold text-[#0A0908] sm:text-lg">
            Round over
          </h2>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[#0A0908] sm:text-3xl">
            {finalTaps.toLocaleString("en-US")} taps
          </p>
          <p className="mt-3 text-sm text-black/45">Imaginary BTC</p>
          <p className="text-xl font-semibold tabular-nums text-[#0A0908] sm:text-2xl">
            {formatImaginaryBtc(btcMined)}
          </p>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-black/35 sm:text-xs">
            Approx. USD value
          </p>
          {priceUsd != null && usdApprox != null && (
            <p className="text-lg font-semibold tabular-nums text-emerald-800 sm:text-xl">
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
            <p className="text-sm text-black/40">{priceError}</p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center">
            <button
              type="button"
              className="cavos-btn-primary px-6 py-3 text-sm font-semibold"
              onClick={() => {
                setPhase("rules");
                setPriceUsd(null);
                setPriceError(null);
              }}
            >
              Play again
            </button>
            <button
              type="button"
              className="cavos-btn-secondary inline-flex min-h-11 w-full cursor-pointer items-center justify-center px-6 py-3 text-sm sm:w-auto"
              onClick={() => router.push("/player")}
            >
              Back to profile
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
