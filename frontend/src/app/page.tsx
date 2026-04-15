"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";
import { LanguageToggle } from "@/components/language-toggle";
import { LeaderboardPanel } from "@/components/leaderboard-panel";
import { useI18n } from "@/context/locale-context";
import { usePlayer } from "@/context/player-context";
import { fetchBtcPriceUsd } from "@/lib/api";
import { formatBtc } from "@/lib/format";

const COFIBLOCKS_STORE_HREF = "https://app.cofiblocks.com/";

export default function Home() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { user, login, leaderboard } = usePlayer();
  const [authOpen, setAuthOpen] = useState(false);
  const [btcPriceUsd, setBtcPriceUsd] = useState<number | null>(null);

  useEffect(() => {
    fetchBtcPriceUsd()
      .then((r) => setBtcPriceUsd(r.priceUsd))
      .catch(() => setBtcPriceUsd(null));
  }, [leaderboard]);

  const onStart = () => {
    if (user) router.push("/player");
    else setAuthOpen(true);
  };

  const liveLabel = locale === "es" ? "Ronda relámpago" : "Lightning round";
  const liveDetail =
    locale === "es" ? "15 segundos. Un toque = 1 BTC imaginario." : "15 seconds. One tap = 1 imaginary BTC.";
  const rewardLabel = locale === "es" ? "Premio real" : "Real reward";
  const leaderboardLabel = locale === "es" ? "Top actual" : "Current top";
  const welcomeBack = locale === "es" ? "Volver a minar" : "Back to mining";
  const rewardCardTitle = locale === "es" ? "Cómo se gana" : "How to win";
  const rewardCardValue = locale === "es" ? "Top 3 del ranking" : "Top 3 on the leaderboard";
  const rewardCardCopy =
    locale === "es"
      ? "Las mejores rondas del tablero se llevan el cupón de café."
      : "The best rounds on the board earn the coffee coupon.";
  const brandCardTitle = locale === "es" ? "Marca aliada" : "Partner brand";
  const brandCardValue = "CofiBlocks";
  const brandCardCopy =
    locale === "es"
      ? "Café de especialidad costarricense con trazabilidad finca-taza."
      : "Costa Rican specialty coffee with farm-to-cup traceability.";
  const topValue =
    leaderboard.length > 0 ? formatBtc(leaderboard[0].bestBtcMined, locale) : "—";
  const topValueCopy =
    leaderboard.length > 0
      ? locale === "es"
        ? `Lidera ${leaderboard[0].username}`
        : `Led by ${leaderboard[0].username}`
      : t("leaderboard.empty");

  return (
    <div className="home-shell relative flex min-h-full flex-1 flex-col overflow-x-hidden">
      <header className="relative z-10 px-4 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-white/45 bg-white/70 px-4 py-3 shadow-[0_10px_30px_rgba(54,31,12,0.08)] backdrop-blur-xl">
          <Link href="/" className="flex items-center">
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-[#0A0908]">Tap2</span>
              <span className="text-btc-orange">Mine</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            {user ? (
              <Link
                href="/player"
                className="rounded-full border border-black/6 bg-white/70 px-3 py-1.5 text-sm font-medium text-[#0A0908]/70 transition-colors hover:text-[#0A0908]"
              >
                @{user.username}
              </Link>
            ) : (
              <span className="rounded-full border border-black/6 bg-white/60 px-3 py-1.5 text-xs font-medium text-black/45">
                {t("common.guest")}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-10 sm:gap-10 sm:px-6 sm:pb-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,249,241,0.97),rgba(246,237,224,0.88))] px-5 py-7 shadow-[0_24px_80px_rgba(69,39,15,0.14)] sm:px-8 sm:py-10 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(247,147,26,0.2),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(35,24,15,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.5),transparent)]" />
          <div className="absolute -right-12 top-10 h-44 w-44 rounded-full bg-[rgba(247,147,26,0.14)] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-48 bg-[radial-gradient(circle_at_bottom_left,rgba(84,51,22,0.14),transparent_70%)]" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-center">
            <div className="max-w-2xl">
              <h1 className="max-w-3xl text-balance font-[family:var(--font-romagothicbold)] text-5xl leading-[0.9] tracking-[-0.06em] text-[#120c08] sm:text-7xl lg:text-[5.5rem]">
                {t("home.heroLine1")}{" "}
                <span className="text-btc-orange drop-shadow-[0_8px_24px_rgba(247,147,26,0.2)]">
                  {t("home.heroOrange")}
                </span>{" "}
                <span className="text-[#7b736d]">{t("home.heroMuted")}</span>
              </h1>

              <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-[#3f3128]/72 sm:text-lg">
                {t("home.subtitle")}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onStart}
                  className="cavos-btn-primary inline-flex min-h-13 items-center justify-center rounded-full px-8 py-4 text-sm sm:px-10 sm:text-base"
                >
                  {user ? welcomeBack : t("home.start")}
                </button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="home-stat-card">
                  <span className="home-stat-label">{liveLabel}</span>
                  <p className="home-stat-value">15s</p>
                  <p className="home-stat-copy">{liveDetail}</p>
                </div>
                <div className="home-stat-card">
                  <span className="home-stat-label">{rewardLabel}</span>
                  <p className="home-stat-value">Top 3</p>
                  <p className="home-stat-copy">{t("home.rewardPartnerBadge")}</p>
                </div>
                <div className="home-stat-card">
                  <span className="home-stat-label">{leaderboardLabel}</span>
                  <p className="home-stat-value">{topValue}</p>
                  <p className="home-stat-copy">{topValueCopy}</p>
                </div>
              </div>
            </div>

            <aside className="relative">
              <div className="absolute inset-x-8 -top-6 h-24 rounded-full bg-[rgba(247,147,26,0.24)] blur-3xl" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[#eadac6] bg-[linear-gradient(180deg,rgba(43,25,12,0.98),rgba(24,15,9,0.94))] p-5 text-white shadow-[0_26px_70px_rgba(35,20,10,0.34)] sm:p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,147,26,0.28),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.07),transparent_35%)]" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f9d3a4]">
                        {t("home.rewardPartnerBadge")}
                      </span>
                      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">
                        CofiBlocks
                      </h2>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/8 p-2">
                      <Image
                        src="/partners/cofiblocks-v2.png"
                        alt={t("footer.altCofiblocks")}
                        width={120}
                        height={120}
                        className="h-14 w-auto object-contain sm:h-16"
                        sizes="(max-width:640px) 120px, 140px"
                      />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                        {rewardCardTitle}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#ffe1b8]">
                        {rewardCardValue}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/68">
                        {rewardCardCopy}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                        {brandCardTitle}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {brandCardValue}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/68">
                        {brandCardCopy}
                      </p>
                    </div>
                  </div>

                  <a
                    href={COFIBLOCKS_STORE_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#f3c58a]/40 bg-[#f7931a] px-5 py-3 text-sm font-semibold text-[#1f140a] transition-transform hover:-translate-y-0.5"
                  >
                    {t("home.rewardStoreLink")}
                    <span aria-hidden>↗</span>
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <LeaderboardPanel
          rows={leaderboard}
          highlightUsername={user?.username}
          priceUsd={btcPriceUsd}
        />
      </main>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(username) => {
          flushSync(() => {
            login(username);
          });
          router.push("/player");
        }}
      />
    </div>
  );
}
