"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { useI18n } from "@/context/locale-context";
import { usePlayer } from "@/context/player-context";
import { fetchBtcPriceUsd } from "@/lib/api";
import { formatImaginaryBtc } from "@/lib/format";

function formatUsd(btc: number, priceUsd: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(btc * priceUsd);
}

export default function PlayerPage() {
  const router = useRouter();
  const { locale, t, intlLocale } = useI18n();
  const { user, highScoreTaps, history, logout } = usePlayer();
  const [priceUsd, setPriceUsd] = useState<number | null>(null);

  useEffect(() => {
    fetchBtcPriceUsd()
      .then((r) => setPriceUsd(r.priceUsd))
      .catch(() => setPriceUsd(null));
  }, []);

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  const recentGames = useMemo(() => history.slice(0, 5), [history]);
  const recentAverage =
    recentGames.length > 0
      ? Math.round(
          recentGames.reduce((sum, game) => sum + game.taps, 0) / recentGames.length,
        )
      : 0;
  const bestUsd = priceUsd != null ? formatUsd(highScoreTaps, priceUsd, intlLocale) : null;
  const recentAverageLabel = locale === "es" ? "Promedio reciente" : "Recent average";
  const recentCountLabel = locale === "es" ? "Últimas partidas" : "Recent games";
  const bestRoundLabel = locale === "es" ? "Mejor marca" : "Best mark";
  const latestFiveLabel =
    locale === "es" ? "Solo mostramos tus últimas 5 partidas." : "Only your latest 5 games are shown.";

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-black/40">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="home-shell relative flex min-h-full flex-1 flex-col overflow-x-hidden">
      <header className="relative z-10 px-4 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-white/45 bg-white/70 px-4 py-3 shadow-[0_10px_30px_rgba(54,31,12,0.08)] backdrop-blur-xl">
          <Link
            href="/"
            className="text-sm font-medium text-black/45 transition-colors hover:text-[#0A0908]"
          >
            {t("nav.home")}
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <span className="rounded-full border border-black/6 bg-white/65 px-3 py-1.5 text-sm font-semibold text-[#0A0908]">
              @{user.username}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-10 sm:gap-10 sm:px-6 sm:pb-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,249,241,0.97),rgba(246,237,224,0.88))] px-5 py-7 shadow-[0_24px_80px_rgba(69,39,15,0.14)] sm:px-8 sm:py-10 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(247,147,26,0.18),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(35,24,15,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.45),transparent)]" />
          <div className="absolute -right-12 top-8 h-44 w-44 rounded-full bg-[rgba(247,147,26,0.12)] blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-[#eadbc7] bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7a5431]">
                {bestRoundLabel}
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#120c08] sm:text-5xl">
                {t("player.title")}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#3f3128]/72 sm:text-base">
                {t("player.bestRound")}
              </p>

              <div className="mt-8 flex flex-col gap-2">
                <p className="font-[family:var(--font-romagothicbold)] text-6xl leading-none tracking-[-0.06em] text-[#120c08] sm:text-[5.5rem]">
                  {formatImaginaryBtc(highScoreTaps, intlLocale)}
                </p>
                {bestUsd && (
                  <p className="bg-[linear-gradient(180deg,#1ea85b_0%,#0f8d48_52%,#0b6f3a_100%)] bg-clip-text text-xl font-extrabold tabular-nums text-transparent drop-shadow-[0_8px_18px_rgba(34,197,94,0.16)] sm:text-2xl">
                    ≈ {bestUsd}
                  </p>
                )}
                <p className="text-sm tabular-nums text-[#6e6053]">
                  {highScoreTaps.toLocaleString(intlLocale)} {t("common.taps")}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/game"
                  className="cavos-btn-primary inline-flex min-h-13 items-center justify-center rounded-full px-8 py-4 text-sm sm:px-10 sm:text-base"
                >
                  {t("player.newGame")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="cavos-btn-secondary inline-flex min-h-13 items-center justify-center rounded-full px-6 py-4 text-sm"
                >
                  {t("player.logOut")}
                </button>
              </div>
            </div>

            <aside className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="home-stat-card">
                <span className="home-stat-label">{recentCountLabel}</span>
                <p className="home-stat-value">{recentGames.length}</p>
                <p className="home-stat-copy">{latestFiveLabel}</p>
              </div>
              <div className="home-stat-card">
                <span className="home-stat-label">{recentAverageLabel}</span>
                <p className="home-stat-value">
                  {recentGames.length > 0 ? `${recentAverage}` : "—"}
                </p>
                <p className="home-stat-copy">
                  {recentGames.length > 0
                    ? locale === "es"
                      ? "toques de media en tu muestra más reciente."
                      : "average taps across your latest sample."
                    : t("player.noGames")}
                </p>
              </div>
              <div className="home-stat-card">
                <span className="home-stat-label">{locale === "es" ? "Jugador" : "Player"}</span>
                <p className="home-stat-value">@{user.username}</p>
                <p className="home-stat-copy">
                  {locale === "es"
                    ? "Tu perfil mantiene el tono del dashboard."
                    : "Your profile now matches the dashboard tone."}
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/55 bg-[linear-gradient(180deg,rgba(255,251,245,0.94),rgba(246,239,229,0.88))] p-4 shadow-[0_24px_80px_rgba(69,39,15,0.12)] sm:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,147,26,0.1),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.38),transparent_70%)]" />
          <div className="absolute right-0 bottom-0 h-44 w-44 translate-x-10 translate-y-12 rounded-full bg-[rgba(95,56,23,0.08)] blur-3xl" />

          <div className="relative z-10">
            <div className="flex flex-col gap-3 border-b border-[#d8c8b5]/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex rounded-full border border-[#eadbc7] bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7a5431]">
                  {locale === "es" ? "Actividad" : "Activity"}
                </span>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#120c08] sm:text-[2rem]">
                  {t("player.recentGames")}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#4e4035]/68">
                  {latestFiveLabel}
                </p>
              </div>
            </div>

            {recentGames.length === 0 ? (
              <div className="mt-4 rounded-[1.35rem] border border-dashed border-[#d9c8b2] bg-white/50 px-5 py-8 text-center">
                <p className="text-sm text-[#5f5147]">{t("player.noGames")}</p>
              </div>
            ) : (
              <ul className="mt-5 space-y-2.5">
                {recentGames.map((game, index) => (
                  <li
                    key={game.id}
                    className={`relative overflow-hidden rounded-[1.1rem] border px-3 py-3 shadow-[0_10px_20px_rgba(80,49,20,0.04)] transition-all duration-200 hover:-translate-y-0.5 sm:px-4 sm:py-3 ${
                      index === 0
                        ? "border-[rgba(245,158,11,0.18)] bg-[linear-gradient(135deg,rgba(255,248,229,0.94),rgba(255,240,209,0.82))] shadow-[0_14px_26px_rgba(180,83,9,0.1)]"
                        : "border-white/60 bg-white/80 hover:bg-white/94"
                    }`}
                  >
                    <div className="absolute inset-y-0 left-0 w-1 rounded-l-[1.1rem] bg-[linear-gradient(180deg,rgba(247,147,26,0.85),rgba(217,119,6,0.45))]" />

                    <div className="pl-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white/75 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7a5431] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a7a6c]">
                              {locale === "es" ? "Run reciente" : "Recent run"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold tabular-nums text-[#120c08] sm:text-base">
                            {new Date(game.playedAt).toLocaleString(intlLocale, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8a7a6c]">
                            {t("common.taps")}
                          </p>
                          <p className="mt-1 text-lg font-semibold tabular-nums text-[#120c08]">
                            {game.taps.toLocaleString(intlLocale)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full border border-[rgba(217,119,6,0.18)] bg-[linear-gradient(180deg,rgba(255,245,224,1),rgba(255,234,196,0.92))] px-2.5 py-1 text-[11px] font-extrabold tabular-nums text-[#92400e] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_6px_12px_rgba(217,119,6,0.08)] sm:text-[12px]">
                          {formatImaginaryBtc(game.btcMined, intlLocale)}
                        </span>
                        {priceUsd != null ? (
                          <span className="inline-flex rounded-full border border-[rgba(16,185,129,0.2)] bg-[linear-gradient(180deg,rgba(223,255,240,1),rgba(195,246,221,0.94))] px-2.5 py-1 text-[11px] font-extrabold tabular-nums text-[#066a49] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_12px_rgba(5,150,105,0.08)] sm:text-[12px]">
                            {formatUsd(game.btcMined, priceUsd, intlLocale)}
                          </span>
                        ) : (
                          <span className="rounded-full border border-black/6 bg-white/60 px-2.5 py-1 text-black/35 tabular-nums">
                            —
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
