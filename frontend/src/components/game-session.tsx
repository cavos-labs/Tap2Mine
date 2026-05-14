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

function prefersLowerParticleCount() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(max-width: 640px)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

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
  const { recordRound, user } = usePlayer();
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
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);

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
    const isPopup = phase === "done";
    document.body.style.overflow = isPopup ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") {
      setShellBg(null);
      return;
    }
    if (warn5) {
      setShellBg("#2d0706");
    } else if (warn10) {
      setShellBg("#291406");
    } else {
      setShellBg("#120b07");
    }
    return () => setShellBg(null);
  }, [phase, warn5, warn10]);

  const finish = useCallback(() => {
    const taps = tapsRef.current;
    setFinalTaps(taps);
    const btcMined = taps * BTC_PER_TAP;
    setSubmitState("submitting");
    setTxHash(null);
    recordRound({ taps, btcMined })
      .then((hash) => {
        setTxHash(hash);
        setSubmitState("submitted");
      })
      .catch(() => {
        setSubmitState("error");
      });
    setPhase("done");
    setConfetti(generateConfetti(prefersLowerParticleCount() ? 28 : 52));
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
    }, 80);
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
    setSubmitState("idle");
    setTxHash(null);
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
      const maxParticles = prefersLowerParticleCount() ? 7 : 12;
      return next.length > maxParticles ? next.slice(-maxParticles) : next;
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

  const timerColor = warn5 ? "#ff6b5f" : warn10 ? "#ffad2f" : "var(--cavos-cream)";

  return (
    <div className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-lg flex-col justify-between gap-3 px-1 pb-1 sm:min-h-[42rem] sm:gap-6 sm:px-0">
      {/* ── Pre-game ── */}
      {phase === "rules" && (
        <div className="flex flex-1 items-center py-2">
          <div className="arcade-panel panel-rise w-full px-5 py-6 text-center sm:px-7 sm:py-8">
            <div className="bg-btc-soft relative mx-auto flex h-24 w-24 items-center justify-center rounded-[1rem] border border-[var(--cavos-border-strong)] shadow-[0_16px_36px_rgba(247,147,26,0.18)]">
              <Image
                src="/partners/cafe.png"
                alt=""
                width={58}
                height={58}
                className="h-14 w-14 object-contain"
                priority
              />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cavos-subtle)]">
              {user ? `@${user.username}` : t("game.readyPlayer")}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-[var(--cavos-cream)] sm:text-4xl">
              {t("game.preTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-6 text-[var(--cavos-muted)] sm:text-base">
              {t("game.rule1")}
            </p>

            <div className="mt-5 grid gap-2 text-left">
              <div className="tap-card flex items-start gap-3 px-4 py-3">
                <span className="step-num shrink-0">1</span>
                <p className="text-sm leading-5 text-[var(--cavos-muted)]">
                  {t("game.preStep1")}
                </p>
              </div>
              <div className="tap-card flex items-start gap-3 px-4 py-3">
                <span className="step-num shrink-0">2</span>
                <p className="text-sm leading-5 text-[var(--cavos-muted)]">
                  {t("game.preStep2")}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="cavos-btn-primary mt-6 w-full py-4 text-base sm:text-lg"
              onClick={startPlaying}
            >
              {t("game.start")}
            </button>
          </div>
        </div>
      )}

      {/* ── Playing ── */}
      {phase === "playing" && (
        <div className="relative flex flex-1 flex-col items-center justify-between gap-3 py-1 sm:gap-4 sm:py-2">
          {/* Timer */}
          <div className="flex w-full flex-col items-center gap-2">
            <div
              className="font-[family:var(--font-romagothicbold)] text-[5.4rem] leading-[0.78] tabular-nums sm:text-9xl"
              style={{ color: timerColor, transition: "color 0.4s ease" }}
            >
              {leftSec}
            </div>

            {warn10 && (
              <p
                className={`min-h-6 text-center text-xs font-extrabold uppercase tracking-[0.2em] sm:text-lg ${
                  warn5 ? "text-[#ff8a80]" : "text-[var(--btc-gold)]"
                }`}
              >
                {warn5 ? t("game.warn5") : t("game.warn10")}
              </p>
            )}

            <div className="tap-card grid min-h-[5.7rem] w-full grid-cols-2 items-center gap-2 px-3 py-3 text-center backdrop-blur-md sm:min-h-[7rem] sm:px-4">
              <p
                className="min-w-0 truncate text-2xl font-black tabular-nums sm:text-4xl"
                style={{ color: "var(--btc-gold)" }}
              >
                {formatImaginaryBtc(liveBtcMined, intlLocale)}
              </p>
              {spotPriceLoading && spotPriceUsd == null && (
                <p className="text-[10px] text-[var(--cavos-subtle)]">{t("game.loadingPrice")}</p>
              )}
              {!spotPriceLoading && spotPriceUsd == null && spotPriceError && (
                <p className="text-[10px] text-[var(--cavos-subtle)]">{t("game.usdUnavailable")}</p>
              )}
              {liveUsdMined != null && (
                <p
                  className="min-w-0 truncate text-2xl font-black tabular-nums drop-shadow-sm sm:text-4xl"
                  style={{ color: "var(--cavos-green)" }}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  ≈ {formatUsdApprox(liveUsdMined, { numberLocale: intlLocale })}
                </p>
              )}
            </div>
          </div>

          {/* Tap button with bean particles */}
          <div className="relative flex min-h-[19rem] flex-1 items-center justify-center py-1 sm:mt-2 sm:min-h-[20rem] sm:flex-none">
            {beans.map((b) => (
              <span
                key={b.id}
                className="coffee-bean"
                style={
                  {
                    top: "50%",
                    left: "50%",
                    marginTop: -14,
                    marginLeft: -14,
                    backgroundImage: "url('/partners/cafe.png')",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                    "--dx": `${b.dx}px`,
                    "--dy": `${b.dy}px`,
                    "--rot": `${b.rot}deg`,
                  } as React.CSSProperties
                }
                aria-hidden
              />
            ))}

            <button
              type="button"
              onClick={onTap}
              className="tap-pop relative z-20 flex touch-manipulation select-none items-center justify-center rounded-full transition-transform active:scale-90"
              style={{
                width: "min(18.5rem, 86vw)",
                height: "min(18.5rem, 86vw)",
                background: warn5
                  ? "radial-gradient(circle, #ffdedb 0%, #ef4444 100%)"
                  : warn10
                    ? "radial-gradient(circle, #ffe5b4 0%, #f97316 100%)"
                    : "radial-gradient(circle, #fff2b5 0%, #f7931a 100%)",
                border: warn5
                  ? "5px solid #ff8a80"
                  : warn10
                    ? "5px solid #ffbf5f"
                    : "5px solid #ffc857",
                boxShadow: warn5
                  ? "0 0 0 10px rgba(255,107,95,0.12), 0 0 60px rgba(239,68,68,0.55), inset 0 -8px 18px rgba(63,15,12,0.24)"
                  : warn10
                    ? "0 0 0 10px rgba(249,115,22,0.12), 0 0 48px rgba(249,115,22,0.5), inset 0 -8px 18px rgba(63,31,12,0.22)"
                    : "0 16px 48px rgba(247,147,26,0.36), 0 0 0 10px rgba(255,200,87,0.08), inset 0 -8px 18px rgba(63,31,12,0.18)",
                transition: "background 0.4s, border-color 0.4s, box-shadow 0.4s",
              }}
            >
              <Image
                src="/partners/cafe.png"
                alt="Tap"
                width={80}
                height={80}
                className="pointer-events-none h-[42%] w-[42%] object-contain drop-shadow-md"
                draggable={false}
                priority
              />
              <span
                className="absolute bottom-[13%] rounded-full bg-black/20 px-3 py-1 text-xs font-black uppercase tabular-nums text-[#2a1205] sm:text-xs"
                style={{
                  color: warn5 ? "#3a0807" : warn10 ? "#3b1705" : "#2a1205",
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
        <div className="mobile-safe-bottom fixed inset-0 z-50 flex items-end justify-center bg-black/68 p-3 backdrop-blur-md sm:items-center sm:p-4">
          <div className="card result-sheet w-full max-w-sm px-5 pb-7 pt-6 text-center sm:max-w-sm sm:px-8 sm:py-10">
            <p className="text-3xl leading-none" aria-hidden>
              🎉
            </p>
            <h2 className="mt-3 text-base font-semibold tracking-tight text-[var(--cavos-muted)] sm:text-lg">
              {t("game.roundOver")}
            </h2>

            <p
              className="mt-5 font-[family:var(--font-romagothicbold)] leading-none text-[var(--cavos-cream)]"
              style={{ fontSize: "clamp(3rem, 12vw, 4.5rem)" }}
            >
              {finalTaps.toLocaleString(intlLocale)}
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--cavos-subtle)]">
              {t("common.taps")}
            </p>

            <div className="bg-btc-soft mx-auto mt-6 w-fit rounded-full border border-[var(--cavos-border)] px-4 py-2">
              <p className="text-base font-bold tabular-nums text-[var(--btc-gold)] sm:text-lg">
                {formatImaginaryBtc(btcMined, intlLocale)}
              </p>
            </div>

            {priceUsd != null && usdApprox != null && (
              <p className="mt-4 text-xl font-extrabold tabular-nums text-[var(--cavos-green)] sm:text-2xl">
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
              <p className="mt-3 text-sm text-[var(--cavos-subtle)]">
                {t("game.priceError")}
              </p>
            )}

            <div className="mx-auto mt-4 max-w-xs rounded-[0.85rem] border border-[var(--cavos-border)] bg-black/18 px-4 py-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cavos-subtle)]">
                {submitState === "submitting"
                  ? t("game.onchainSubmitting")
                  : submitState === "submitted"
                    ? t("game.onchainSubmitted")
                    : submitState === "error"
                      ? t("game.onchainError")
                      : t("game.onchainReady")}
              </p>
              {txHash && (
                <a
                  href={`https://sepolia.voyager.online/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block truncate text-[11px] font-semibold text-[var(--btc-gold)] underline underline-offset-2"
                >
                  {txHash.slice(0, 10)}…{txHash.slice(-6)}
                </a>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-2.5">
              <button
                type="button"
                className="cavos-btn-primary w-full py-4 text-base sm:text-lg"
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
                className="min-h-11 w-full py-3 text-sm font-semibold text-[var(--cavos-subtle)] transition-colors hover:text-[var(--cavos-cream)]"
                onClick={() => router.push("/")}
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
