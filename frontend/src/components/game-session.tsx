"use client";

import Image from "next/image";
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

type Bean = { id: number; dx: number; dy: number; rot: number };

let beanId = 0;

const CONFETTI_COLORS = [
  "#f7931a", "#f59e0b", "#10b981", "#3b82f6",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

type ConfettiPiece = {
  id: number;
  left: number;
  size: number;
  color: string;
  fall: number;
  spin: number;
  dur: number;
  delay: number;
};

let confettiId = 0;

function generateConfetti(count: number): ConfettiPiece[] {
  const pieces: ConfettiPiece[] = [];
  for (let i = 0; i < count; i++) {
    pieces.push({
      id: ++confettiId,
      left: Math.random() * 100,
      size: 6 + Math.random() * 8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      fall: 300 + Math.random() * 500,
      spin: (Math.random() - 0.5) * 720,
      dur: 1.5 + Math.random() * 2,
      delay: Math.random() * 0.8,
    });
  }
  return pieces;
}

function setShellBg(color: string | null) {
  const el = document.getElementById("app-shell");
  if (el) el.style.backgroundColor = color ?? "";
}

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
  const [spotPriceUsd, setSpotPriceUsd] = useState<number | null>(null);
  const [spotPriceLoading, setSpotPriceLoading] = useState(true);
  const [spotPriceError, setSpotPriceError] = useState(false);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

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

  const warn10 = phase === "playing" && leftMs <= PHASE_LAST_10_MS;
  const warn5 = phase === "playing" && leftMs <= PHASE_LAST_5_MS;

  useEffect(() => {
    const isPopup = phase === "rules" || phase === "done";
    document.body.style.overflow = isPopup ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") {
      setShellBg(null);
      return;
    }
    if (warn5) {
      setShellBg("#fde8e8");
    } else if (warn10) {
      setShellBg("#fff3e0");
    } else {
      setShellBg("#fffbf5");
    }
    return () => setShellBg(null);
  }, [phase, warn5, warn10]);

  const finish = useCallback(() => {
    const taps = tapsRef.current;
    setFinalTaps(taps);
    const btcMined = taps * BTC_PER_TAP;
    recordRound({ taps, btcMined });
    setPhase("done");
    setConfetti(generateConfetti(60));
    setTimeout(() => setConfetti([]), 4000);
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
    setBeans([]);
    setPhase("playing");
    fetchBtcPriceUsd()
      .then((r) => {
        setSpotPriceUsd(r.priceUsd);
        setSpotPriceError(false);
      })
      .catch(() => setSpotPriceError(true));
  };

  const spawnBean = useCallback(() => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 50;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const rot = (Math.random() - 0.5) * 360;
    const id = ++beanId;
    setBeans((prev) => {
      const next = [...prev, { id, dx, dy, rot }];
      return next.length > 15 ? next.slice(-15) : next;
    });
    setTimeout(() => {
      setBeans((prev) => prev.filter((b) => b.id !== id));
    }, 700);
  }, []);

  const onTap = () => {
    if (phase !== "playing") return;
    tapsRef.current += 1;
    setTapTick((k) => k + 1);
    spawnBean();
  };

  const leftSec = Math.ceil(leftMs / 1000);

  const btcMined = finalTaps * BTC_PER_TAP;
  const usdApprox = priceUsd != null ? btcMined * priceUsd : null;

  const liveBtcMined = tapTick * BTC_PER_TAP;
  const liveUsdMined =
    phase === "playing" && spotPriceUsd != null
      ? liveBtcMined * spotPriceUsd
      : null;

  const timerColor = warn5 ? "#dc2626" : warn10 ? "#ea580c" : "#0A0908";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-2 sm:gap-8 sm:px-0">
      {/* ── Rules popup ── */}
      {phase === "rules" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xs rounded-3xl bg-white px-6 py-8 text-center shadow-2xl sm:max-w-sm sm:px-8 sm:py-10">
            <p className="text-4xl leading-none">👆</p>
            <h2 className="mt-3 text-xl font-extrabold text-[#0A0908] sm:text-2xl">
              {t("game.rulesTitle")}
            </h2>
            <p className="mt-5 text-base font-medium leading-snug text-black/70 sm:text-lg">
              {t("game.rule1")}
            </p>
            <p className="mt-3 text-sm leading-snug text-black/50 sm:text-base">
              {t("game.rule2")}
            </p>
            <button
              type="button"
              className="cavos-btn-primary mt-8 w-full py-4 text-base font-bold sm:text-lg"
              onClick={startPlaying}
            >
              {t("game.start")}
            </button>
          </div>
        </div>
      )}

      {/* ── Playing ── */}
      {phase === "playing" && (
        <div className="relative flex flex-col items-center gap-2 sm:gap-4">
          {/* Timer */}
          <div
            className="text-8xl font-black tabular-nums tracking-tighter sm:text-9xl"
            style={{ color: timerColor, transition: "color 0.4s ease" }}
          >
            {leftSec}
          </div>

          {warn10 && (
            <p
              className={`text-base font-extrabold uppercase tracking-widest sm:text-lg ${
                warn5 ? "text-red-600" : "text-orange-600"
              }`}
            >
              {warn5 ? t("game.warn5") : t("game.warn10")}
            </p>
          )}

          {/* Live BTC + USD */}
          <div className="flex flex-col items-center">
            <p
              className="text-4xl font-black tabular-nums tracking-tight sm:text-5xl"
              style={{ color: "#b45309" }}
            >
              {formatImaginaryBtc(liveBtcMined, intlLocale)}
            </p>
            {spotPriceLoading && spotPriceUsd == null && (
              <p className="text-[10px] text-black/35">{t("game.loadingPrice")}</p>
            )}
            {!spotPriceLoading && spotPriceUsd == null && spotPriceError && (
              <p className="text-[10px] text-black/35">{t("game.usdUnavailable")}</p>
            )}
            {liveUsdMined != null && (
              <p
                className="text-4xl font-black tabular-nums tracking-tight drop-shadow-sm sm:text-5xl"
                style={{ color: "#059669" }}
                aria-live="polite"
                aria-atomic="true"
              >
                ≈ {formatUsdApprox(liveUsdMined, { numberLocale: intlLocale })}
              </p>
            )}
          </div>

          {/* Tap button with bean particles */}
          <div className="relative mt-1 flex items-center justify-center sm:mt-3">
            {beans.map((b) => (
              <Image
                key={b.id}
                src="/partners/cafe.png"
                alt=""
                width={36}
                height={36}
                className="coffee-bean"
                style={
                  {
                    top: "50%",
                    left: "50%",
                    marginTop: -14,
                    marginLeft: -14,
                    "--dx": `${b.dx}px`,
                    "--dy": `${b.dy}px`,
                    "--rot": `${b.rot}deg`,
                  } as React.CSSProperties
                }
                aria-hidden
                draggable={false}
              />
            ))}

            <button
              type="button"
              onClick={onTap}
              className="relative z-20 flex touch-manipulation select-none items-center justify-center rounded-full transition-transform active:scale-90"
              style={{
                width: "min(13rem, 75vw)",
                height: "min(13rem, 75vw)",
                background: warn5
                  ? "radial-gradient(circle, #fef2f2 0%, #fecaca 100%)"
                  : warn10
                    ? "radial-gradient(circle, #fff7ed 0%, #fed7aa 100%)"
                    : "radial-gradient(circle, #fffbeb 0%, #fde68a 100%)",
                border: warn5
                  ? "4px solid #ef4444"
                  : warn10
                    ? "4px solid #f97316"
                    : "4px solid #f59e0b",
                boxShadow: warn5
                  ? "0 0 50px rgba(239,68,68,0.4), inset 0 -4px 12px rgba(239,68,68,0.15)"
                  : warn10
                    ? "0 0 40px rgba(249,115,22,0.35), inset 0 -4px 12px rgba(249,115,22,0.15)"
                    : "0 8px 32px rgba(245,158,11,0.3), inset 0 -4px 12px rgba(245,158,11,0.1)",
                transition: "background 0.4s, border-color 0.4s, box-shadow 0.4s",
              }}
            >
              <Image
                src="/partners/cafe.png"
                alt="Tap"
                width={80}
                height={80}
                className="pointer-events-none h-[38%] w-[38%] object-contain drop-shadow-md"
                draggable={false}
                priority
              />
              <span
                className="absolute bottom-[14%] text-[11px] font-bold tabular-nums sm:text-xs"
                style={{
                  color: warn5 ? "#991b1b" : warn10 ? "#9a3412" : "#92400e",
                }}
              >
                {tapTick} taps
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── Confetti ── */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="confetti-piece"
          style={{
            left: `${c.left}%`,
            top: "-10px",
            "--size": `${c.size}px`,
            "--clr": c.color,
            "--fall": `${c.fall}px`,
            "--spin": `${c.spin}deg`,
            "--dur": `${c.dur}s`,
            "--delay": `${c.delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* ── Done (popup overlay like rules) ── */}
      {phase === "done" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-3xl bg-white px-6 py-10 text-center shadow-2xl sm:max-w-sm sm:px-8 sm:py-12">
            <p className="text-3xl leading-none">🎉</p>
            <h2 className="mt-4 text-lg font-bold text-[#0A0908] sm:text-xl">
              {t("game.roundOver")}
            </h2>

            <p className="mt-6 text-4xl font-black tabular-nums text-[#0A0908] sm:text-5xl">
              {finalTaps.toLocaleString(intlLocale)}
            </p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-widest text-black/35">
              {t("common.taps")}
            </p>

            <div className="mx-auto mt-6 w-fit rounded-xl px-5 py-2.5" style={{ backgroundColor: "#fef9ec" }}>
              <p
                className="text-base font-bold tabular-nums sm:text-lg"
                style={{ color: "#b45309" }}
              >
                {formatImaginaryBtc(btcMined, intlLocale)}
              </p>
            </div>

            {priceUsd != null && usdApprox != null && (
              <p
                className="mt-5 text-xl font-extrabold tabular-nums sm:text-2xl"
                style={{ color: "#059669" }}
              >
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
              <p className="mt-3 text-sm text-black/35">{t("game.priceError")}</p>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                className="cavos-btn-primary w-full py-4 text-base font-bold sm:text-lg"
                onClick={() => {
                  setPriceUsd(null);
                  setPriceUnavailable(false);
                  setConfetti([]);
                  startPlaying();
                }}
              >
                {t("game.playAgain")}
              </button>
              <button
                type="button"
                className="w-full py-3 text-sm font-semibold text-black/45 transition-colors hover:text-[#0A0908]"
                onClick={() => router.push("/player")}
              >
                {t("game.backToProfile")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
