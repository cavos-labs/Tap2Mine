"use client";

import { useEffect, useMemo, useState } from "react";
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
  const {
    user,
    login,
    logout,
    leaderboard,
    highScoreTaps,
    history,
    isAuthenticated,
    openWalletModal,
    profileCheckedAddress,
    walletAddress,
  } = usePlayer();
  const [authOpen, setAuthOpen] = useState(false);
  const [btcPriceUsd, setBtcPriceUsd] = useState<number | null>(null);
  const [addressCopied, setAddressCopied] = useState(false);

  useEffect(() => {
    fetchBtcPriceUsd()
      .then((r) => setBtcPriceUsd(r.priceUsd))
      .catch(() => setBtcPriceUsd(null));
  }, [leaderboard]);

  const topTen = useMemo(() => leaderboard.slice(0, 10), [leaderboard]);
  const lastThree = useMemo(() => history.slice(0, 3), [history]);

  const onStart = () => {
    if (user) {
      router.push("/game");
      return;
    }
    if (isAuthenticated && walletAddress && profileCheckedAddress === walletAddress) {
      setAuthOpen(true);
      return;
    }
    openWalletModal();
  };

  useEffect(() => {
    if (
      isAuthenticated &&
      walletAddress &&
      profileCheckedAddress === walletAddress &&
      !user
    ) {
      setAuthOpen(true);
    }
  }, [isAuthenticated, profileCheckedAddress, user, walletAddress]);

  const startLabel = user ? t("home.playNow") : t("home.start");
  const bestUsd =
    user && highScoreTaps > 0 && btcPriceUsd != null
      ? formatUsd(highScoreTaps, btcPriceUsd, intlLocale)
      : null;
  const statusLabel = user
    ? t("home.status.ready")
    : isAuthenticated && walletAddress
      ? t("home.status.needsName")
      : t("home.status.guest");
  const statusDetail = user
    ? `@${user.username}`
    : isAuthenticated && walletAddress
      ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
      : t("home.status.connectCopy");
  const shortWalletAddress = walletAddress
    ? `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`
    : "";
  const canCopyAddress = Boolean(walletAddress);

  const copyWalletAddress = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setAddressCopied(true);
    window.setTimeout(() => setAddressCopied(false), 1600);
  };

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-x-hidden">
      <header className="mobile-safe-top relative z-20 px-3 py-3 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-[0.9rem] border border-[var(--cavos-border)] bg-[#170d08]/82 px-3 py-2.5 shadow-[0_12px_34px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-4 sm:py-3">
          <Link href="/" className="flex min-h-11 min-w-0 items-center">
            <span className="font-[family:var(--font-romagothicbold)] text-2xl leading-none text-[var(--cavos-cream)] sm:text-3xl">
              <span>Tap2</span>
              <span className="text-btc-orange">Mine</span>
            </span>
          </Link>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <LanguageToggle />
            {user ? (
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="arcade-chip max-w-[6.75rem] truncate sm:max-w-[10rem]">
                  @{user.username}
                </span>
                <button
                  type="button"
                  onClick={() => void logout()}
                  aria-label={t("home.signOut")}
                  title={t("home.signOut")}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--cavos-border)] text-[var(--cavos-subtle)] transition-colors hover:border-[var(--cavos-border-strong)] hover:text-[var(--cavos-cream)] sm:h-9 sm:w-9"
                >
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M10 6H7.75A2.75 2.75 0 0 0 5 8.75v6.5A2.75 2.75 0 0 0 7.75 18H10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M14 8l4 4-4 4M18 12H9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ) : isAuthenticated && walletAddress ? (
              <span className="arcade-chip max-w-[8.5rem] truncate sm:max-w-none">
                {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
              </span>
            ) : (
              <span className="arcade-chip text-[11px]">
                {t("common.guest")}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mobile-safe-bottom relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-3 pb-8 sm:gap-7 sm:px-6 sm:pb-14">
        <section className="arcade-panel panel-rise w-full max-w-full px-4 py-5 sm:px-8 sm:py-8">
          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
            <div className="min-w-0">
              <span className="eyebrow">{t("home.eyebrow")}</span>
              <h1
                className="mt-2 max-w-full text-balance font-[family:var(--font-romagothicbold)] leading-[0.9] text-[var(--cavos-cream)] sm:leading-[0.86]"
                style={{ fontSize: "clamp(2.75rem, 15.5vw, 5.4rem)" }}
              >
                {t("home.heroTitle")}
              </h1>
              <p className="mt-3 max-w-full overflow-hidden text-pretty text-[15px] leading-6 text-[var(--cavos-muted)] sm:max-w-xl sm:text-base sm:leading-7">
                {t("home.heroSubtitle")}
              </p>
            </div>

            <div className="tap-card relative max-w-full overflow-hidden p-3.5 backdrop-blur sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--cavos-subtle)]">
                    {t("home.status.label")}
                  </p>
                  <p className="mt-1 truncate text-base font-extrabold text-[var(--cavos-cream)]">
                    {statusLabel}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[var(--cavos-muted)]">
                    {statusDetail}
                  </p>
                </div>
                <span className="bg-cavos-green mt-1 inline-flex h-3 w-3 shrink-0 rounded-full shadow-[0_0_0_5px_rgba(37,208,125,0.14)]" />
              </div>
              {canCopyAddress && (
                <div className="mt-3 rounded-[0.75rem] border border-[var(--cavos-border)] bg-black/16 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--cavos-subtle)]">
                    {t("home.walletAddress")}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-[var(--cavos-muted)]" title={walletAddress ?? undefined}>
                      {shortWalletAddress}
                    </p>
                    <button
                      type="button"
                      onClick={() => void copyWalletAddress()}
                      className="min-h-8 shrink-0 rounded-full border border-[var(--cavos-border)] px-2.5 py-1 text-[11px] font-bold text-[var(--btc-gold)] transition-colors hover:border-[var(--cavos-border-strong)] hover:bg-[rgba(247,147,26,0.14)]"
                    >
                      {addressCopied ? t("home.copied") : t("home.copyAddress")}
                    </button>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={onStart}
                className="cavos-btn-primary mt-4 inline-flex min-h-[3.35rem] w-full max-w-full items-center justify-center px-5 py-4 text-sm sm:px-8 sm:text-base"
              >
                {startLabel}
              </button>
              <p className="mt-3 truncate text-center text-xs leading-5 text-[var(--cavos-subtle)] sm:whitespace-normal">
                {user ? t("home.status.readyCopy") : t("home.status.guestCopy")}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-7">
          <div className="flex flex-col gap-4 sm:gap-6">
            {user && (
              <section className="card panel-rise relative overflow-hidden p-4 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="eyebrow">{t("home.hub.eyebrow")}</span>
                    <h2 className="mt-2.5 text-2xl font-extrabold text-[var(--cavos-cream)] sm:text-[1.75rem]">
                      {t("home.hub.title")}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--cavos-muted)]">
                      {t("home.hub.caption")}
                    </p>
                  </div>
                  <Link
                    href="/game"
                    className="cavos-btn-primary inline-flex min-h-[3rem] w-full items-center justify-center px-7 py-3 text-sm sm:w-auto"
                  >
                    {t("home.playNow")}
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="tap-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cavos-subtle)]">
                      {t("home.yourBest.title")}
                    </p>
                    {highScoreTaps > 0 ? (
                      <>
                        <p className="mt-2 font-[family:var(--font-romagothicbold)] text-4xl leading-none text-[var(--cavos-cream)] sm:text-5xl">
                          {highScoreTaps.toLocaleString(intlLocale)}
                        </p>
                        <p className="mt-1 text-xs text-[var(--cavos-muted)]">
                          {formatImaginaryBtc(highScoreTaps, intlLocale)}
                          {bestUsd && (
                            <span className="ml-1.5 font-semibold text-[var(--cavos-green)]">
                              · ≈ {bestUsd}
                            </span>
                          )}
                        </p>
                      </>
                    ) : (
                      <p className="mt-3 text-sm text-[var(--cavos-muted)]">
                        {t("home.yourBest.empty")}
                      </p>
                    )}
                  </div>

                  <div className="tap-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cavos-subtle)]">
                      {t("home.recent.title")}
                    </p>
                    {lastThree.length === 0 ? (
                      <p className="mt-3 text-sm text-[var(--cavos-muted)]">
                        {t("home.recent.empty")}
                      </p>
                    ) : (
                      <ul className="mt-3 grid gap-2">
                        {lastThree.map((run) => (
                          <li
                            key={run.id}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="truncate text-[var(--cavos-muted)]">
                              {new Date(run.playedAt).toLocaleDateString(intlLocale, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="font-semibold tabular-nums text-[var(--cavos-cream)]">
                              {run.taps.toLocaleString(intlLocale)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cavos-subtle)]">
                  @{user.username}
                </div>
              </section>
            )}

            <section className="card panel-rise relative overflow-hidden p-4 sm:p-7">
              <span className="eyebrow">{t("home.howTo.eyebrow")}</span>
              <h2 className="mt-2.5 text-2xl font-extrabold text-[var(--cavos-cream)] sm:text-[1.75rem]">
                {t("home.howTo.title")}
              </h2>
              <ol className="mt-4 grid gap-2.5 sm:grid-cols-3 sm:gap-4">
                {[1, 2, 3].map((n) => (
                  <li
                    key={n}
                    className="tap-card flex items-start gap-3 p-3.5 sm:flex-col sm:gap-3 sm:p-4"
                  >
                    <span className="step-num shrink-0">{n}</span>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--cavos-cream)] sm:text-base">
                        {t(`home.howTo.step${n}Title`)}
                      </h3>
                      <p className="mt-1 text-[13px] leading-5 text-[var(--cavos-muted)] sm:text-sm">
                        {t(`home.howTo.step${n}Body`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="bg-btc-soft mt-4 rounded-[0.85rem] border border-[var(--cavos-border-strong)] px-4 py-3">
                <p className="text-sm text-[var(--cavos-muted)]">{t("home.prizeNotice")}</p>
                <Link
                  href="https://www.ticoblockchain.cr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-8 items-center text-sm font-bold text-[var(--btc-gold)] underline underline-offset-2"
                >
                  {t("home.eventLinkLabel")}
                </Link>
              </div>
            </section>
          </div>

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
        onAuthenticated={async (username) => {
          await login(username);
          router.push("/game");
        }}
      />
    </div>
  );
}
