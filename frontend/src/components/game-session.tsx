"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BTC_PER_TAP,
  GAME_DURATION_MS,
  PHASE_LAST_10_MS,
  PHASE_LAST_5_MS,
} from "@/lib/constants";
import { useI18n } from "@/context/locale-context";
import { usePlayer } from "@/context/player-context";
import { fetchBtcPriceUsd } from "@/lib/api";
import { formatImaginaryBtc, formatUsdApprox } from "@/lib/format";

type Phase = "rules" | "playing" | "done";

export function GameSession() {
  const router = useRouter();
  const { t, intlLocale } = useI18n();
  const { recordRound } = usePlayer();
  const [phase, setPhase] = useState<Phase>("rules");
  const [leftMs, setLeftMs] = useState(GAME_DURATION_MS);
  const tapsRef = useRef(0);
  const [tapTick, setTapTick] = useState(0);
  const endAtRef = useRef(0);
  const [finalTaps, setFinalTaps] = useState(0);
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [priceUnavailable, setPriceUnavailable] = useState(false);
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
        setPriceUnavailable(false);
      })
      .catch(() => {
        setPriceUnavailable(true);
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
    setTapTick((k) => k + 1);
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
        <section className="cavos-card cavos-card--rules p-4 sm:p-6">
          <h2 className="mb-3 text-base font-bold text-[#0A0908] sm:text-lg">
            {t("game.rulesTitle")}
          </h2>
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-black/55 sm:text-base">
            <li>{t("game.rule1")}</li>
            <li>{t("game.rule2")}</li>
            <li>{t("game.rule3")}</li>
            <li>{t("game.rule4")}</li>
          </ul>
          <button
            type="button"
            className="cavos-btn-primary mt-6 w-full py-3.5 text-sm font-semibold sm:mt-8 sm:py-4 sm:text-base"
            onClick={startPlaying}
          >
            {t("game.start")}
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
            <p className="text-[11px] text-black/40">{t("game.loadingPrice")}</p>
          )}
          {!spotPriceLoading && spotPriceUsd == null && spotPriceError && (
            <p className="text-[11px] text-black/40">{t("game.usdUnavailable")}</p>
          )}
          {liveUsdMined != null && (
            <p
              className="max-w-[min(100%,20rem)] text-center text-2xl font-bold tabular-nums tracking-tight text-emerald-700 drop-shadow-sm sm:text-3xl md:text-4xl"
              aria-live="polite"
              aria-atomic="true"
            >
              ≈{" "}
              {formatUsdApprox(liveUsdMined, { numberLocale: intlLocale })}
            </p>
          )}
          {warn10 && (
            <p
              className={`text-xs font-semibold uppercase tracking-widest sm:text-sm ${
                warn5 ? "text-red-700" : "text-black/45"
              }`}
            >
              {warn5 ? t("game.warn5") : t("game.warn10")}
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
            {t("game.tapButton")}
            <span className="absolute bottom-[18%] max-w-[90%] truncate px-1 text-[10px] font-semibold tabular-nums text-black/45 sm:bottom-6 sm:text-xs">
              {t("game.tapCountBtc", { count: tapTick })}
            </span>
          </button>
        </div>
      )}

      {phase === "done" && (
        <section className="cavos-card p-4 text-center sm:p-6">
          <h2 className="text-base font-bold text-[#0A0908] sm:text-lg">
            {t("game.roundOver")}
          </h2>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[#0A0908] sm:text-3xl">
            {finalTaps.toLocaleString(intlLocale)} {t("common.taps")}
          </p>
          <p className="mt-3 text-sm text-black/45">{t("game.imaginaryBtc")}</p>
          <p className="text-xl font-semibold tabular-nums text-[#0A0908] sm:text-2xl">
            {formatImaginaryBtc(btcMined, intlLocale)}
          </p>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-black/35 sm:text-xs">
            {t("game.approxUsd")}
          </p>
          {priceUsd != null && usdApprox != null && (
            <p className="text-lg font-semibold tabular-nums text-emerald-800 sm:text-xl">
              ≈{" "}
              {usdApprox.toLocaleString(intlLocale, {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              })}
            </p>
          )}
          {priceUnavailable && (
            <p className="text-sm text-black/40">{t("game.priceError")}</p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center">
            <button
              type="button"
              className="cavos-btn-primary px-6 py-3 text-sm font-semibold"
              onClick={() => {
                setPhase("rules");
                setPriceUsd(null);
                setPriceUnavailable(false);
              }}
            >
              {t("game.playAgain")}
            </button>
            <button
              type="button"
              className="cavos-btn-secondary inline-flex min-h-11 w-full cursor-pointer items-center justify-center px-6 py-3 text-sm sm:w-auto"
              onClick={() => router.push("/player")}
            >
              {t("game.backToProfile")}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
