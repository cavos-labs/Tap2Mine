"use client";

import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";
import { LanguageToggle } from "@/components/language-toggle";
import { LeaderboardPanel } from "@/components/leaderboard-panel";
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

export default function Home() {
  const router = useRouter();
  const { t, intlLocale } = useI18n();
  const { user, login, logout, leaderboard, highScoreTaps, history } = usePlayer();
  const [authOpen, setAuthOpen] = useState(false);
  const [btcPriceUsd, setBtcPriceUsd] = useState<number | null>(null);

  useEffect(() => {
    fetchBtcPriceUsd()
      .then((r) => setBtcPriceUsd(r.priceUsd))
      .catch(() => setBtcPriceUsd(null));
  }, [leaderboard]);

  const topTen = useMemo(() => leaderboard.slice(0, 10), [leaderboard]);
  const lastThree = useMemo(() => history.slice(0, 3), [history]);

  const onStart = () => {
    if (user) router.push("/game");
    else setAuthOpen(true);
  };

  const startLabel = user ? t("home.playNow") : t("home.start");
  const bestUsd =
    user && highScoreTaps > 0 && btcPriceUsd != null
      ? formatUsd(highScoreTaps, btcPriceUsd, intlLocale)
      : null;

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-x-hidden">
      <header className="mobile-safe-top relative z-10 px-3 py-3 sm:px-6 sm:py-5">
        <div className="card mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          <Link href="/" className="flex items-center">
            <span className="text-base font-semibold tracking-tight sm:text-lg">
              <span className="text-[#0A0908]">Tap2</span>
              <span className="text-btc-orange">Mine</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <LanguageToggle />
            {user ? (
              <span className="max-w-[8.5rem] truncate rounded-full border border-[var(--cavos-border)] bg-white px-2.5 py-1 text-xs font-medium text-[#0A0908] sm:max-w-none sm:px-3 sm:py-1.5 sm:text-sm">
                @{user.username}
              </span>
            ) : (
              <span className="rounded-full border border-[var(--cavos-border)] bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--cavos-subtle)] sm:px-3 sm:py-1.5 sm:text-xs">
                {t("common.guest")}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mobile-safe-bottom relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-3 pb-8 sm:gap-10 sm:px-6 sm:pb-14">
        {/* Hero */}
        <section className="card-quiet relative overflow-hidden px-5 py-7 sm:px-10 sm:py-12">
          <div className="relative max-w-3xl">
            <span className="eyebrow">{t("home.eyebrow")}</span>
            <h1 className="mt-3 text-balance font-[family:var(--font-romagothicbold)] leading-[0.92] tracking-[-0.05em] text-[#120c08]"
                style={{ fontSize: "clamp(2.5rem, 8.4vw, 5.25rem)" }}>
              {t("home.heroTitle")}
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-[15px] leading-7 text-[var(--cavos-muted)] sm:text-base">
              {t("home.heroSubtitle")}
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={onStart}
                className="cavos-btn-primary inline-flex min-h-[3.25rem] w-full items-center justify-center px-8 py-4 text-sm sm:w-auto sm:px-10 sm:text-base"
              >
                {startLabel}
              </button>
            </div>
          </div>
        </section>

        {/* Two-column layout from lg */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* How to play */}
            <section className="card relative overflow-hidden p-5 sm:p-7">
              <span className="eyebrow">{t("home.howTo.eyebrow")}</span>
              <h2 className="mt-2.5 text-2xl font-semibold tracking-tight text-[#120c08] sm:text-[1.75rem]">
                {t("home.howTo.title")}
              </h2>
              <ol className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
                {[1, 2, 3].map((n) => (
                  <li
                    key={n}
                    className="flex items-start gap-3 rounded-[1rem] border border-[var(--cavos-border)] bg-white p-4 sm:flex-col sm:gap-3"
                  >
                    <span className="step-num shrink-0">{n}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#120c08] sm:text-base">
                        {t(`home.howTo.step${n}Title`)}
                      </h3>
                      <p className="mt-1 text-[13px] leading-5 text-[var(--cavos-muted)] sm:text-sm">
                        {t(`home.howTo.step${n}Body`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-4 rounded-[1rem] border border-[var(--cavos-border)] bg-[var(--btc-orange-soft)] px-4 py-3">
                <p className="text-sm text-[#7a5431]">{t("home.prizeNotice")}</p>
                <Link
                  href="https://www.ticoblockchain.cr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex text-sm font-semibold text-[#b45309] underline underline-offset-2"
                >
                  {t("home.eventLinkLabel")}
                </Link>
              </div>
            </section>

            {/* Your best (only if logged in) */}
            {user && (
              <section className="card relative overflow-hidden p-5 sm:p-7">
                <span className="eyebrow">{t("home.yourBest.eyebrow")}</span>
                <h2 className="mt-2.5 text-2xl font-semibold tracking-tight text-[#120c08] sm:text-[1.75rem]">
                  {t("home.yourBest.title")}
                </h2>
                <p className="mt-1 text-sm text-[var(--cavos-muted)]">
                  {t("home.yourBest.caption")}
                </p>

                {highScoreTaps > 0 ? (
                  <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-3">
                    <p
                      className="font-[family:var(--font-romagothicbold)] leading-none tracking-[-0.05em] text-[#120c08]"
                      style={{ fontSize: "clamp(2.6rem, 8vw, 4.5rem)" }}
                    >
                      {formatImaginaryBtc(highScoreTaps, intlLocale)}
                    </p>
                    {bestUsd && (
                      <p className="text-xl font-extrabold tabular-nums text-[#059669] sm:text-2xl">
                        ≈ {bestUsd}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-[var(--cavos-muted)]">
                    {t("home.yourBest.empty")}
                  </p>
                )}

                <p className="mt-3 text-[13px] tabular-nums text-[var(--cavos-subtle)]">
                  {highScoreTaps.toLocaleString(intlLocale)} {t("common.taps")}
                </p>
              </section>
            )}

            {/* Recent runs (only if logged in) */}
            {user && (
              <section className="card relative overflow-hidden p-5 sm:p-7">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <span className="eyebrow">{t("home.recent.eyebrow")}</span>
                    <h2 className="mt-2.5 text-xl font-semibold tracking-tight text-[#120c08] sm:text-2xl">
                      {t("home.recent.title")}
                    </h2>
                  </div>
                </div>

                {lastThree.length === 0 ? (
                  <p className="mt-5 text-sm text-[var(--cavos-muted)]">
                    {t("home.recent.empty")}
                  </p>
                ) : (
                  <ul className="mt-5 grid gap-2.5">
                    {lastThree.map((run, i) => (
                      <li
                        key={run.id}
                        className="flex items-center justify-between gap-3 rounded-[1rem] border border-[var(--cavos-border)] bg-white px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="step-num shrink-0">{i + 1}</span>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold tabular-nums text-[#120c08] sm:text-sm">
                              {new Date(run.playedAt).toLocaleString(intlLocale, {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                            <p className="text-[12px] text-[var(--cavos-subtle)] sm:text-[13px]">
                              {formatImaginaryBtc(run.btcMined, intlLocale)}
                              {btcPriceUsd != null && (
                                <span className="ml-1.5 text-[#059669]">
                                  · ≈ {formatUsd(run.btcMined, btcPriceUsd, intlLocale)}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <p className="shrink-0 text-lg font-semibold tabular-nums tracking-tight text-[#120c08] sm:text-xl">
                          {run.taps.toLocaleString(intlLocale)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Link
                    href="/game"
                    className="cavos-btn-primary inline-flex min-h-[3rem] items-center justify-center px-6 py-3 text-sm sm:w-auto"
                  >
                    {t("home.playNow")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                    }}
                    className="cavos-btn-secondary inline-flex min-h-[3rem] items-center justify-center px-5 py-3 text-sm sm:w-auto"
                  >
                    {t("home.signOut")}
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Right column: leaderboard */}
          <aside className="lg:sticky lg:top-6">
            <LeaderboardPanel
              rows={topTen}
              highlightUsername={user?.username}
              priceUsd={btcPriceUsd}
            />
          </aside>
        </div>
      </main>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(username) => {
          flushSync(() => {
            login(username);
          });
          router.push("/game");
        }}
      />
    </div>
  );
}
