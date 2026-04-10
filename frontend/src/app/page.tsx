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

const COFIBLOCKS_STORE_HREF = "https://app.cofiblocks.com/";

export default function Home() {
  const router = useRouter();
  const { t } = useI18n();
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

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-black/[0.06] bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight"
          >
            <span className="text-[#0A0908]">Tap2</span>
            <span className="text-btc-orange">Mine</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            {user ? (
              <Link
                href="/player"
                className="text-sm font-medium text-black/45 transition-colors hover:text-[#0A0908]"
              >
                @{user.username}
              </Link>
            ) : (
              <span className="text-xs font-medium text-black/35">
                {t("common.guest")}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12">
        <section className="text-center">

          <h1 className="text-balance text-4xl font-bold tracking-tighter text-[#0A0908] sm:text-6xl sm:leading-[1.05]">
            {t("home.heroLine1")}{" "}
            <span className="text-btc-orange">{t("home.heroOrange")}</span>{" "}
            <span className="text-black/35">{t("home.heroMuted")}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-black/45 sm:text-base">
            {t("home.subtitle")}
          </p>
          <div
            className="mx-auto mt-4 max-w-lg overflow-hidden rounded-2xl shadow-[0_4px_28px_rgba(5,150,105,0.1)] sm:mt-5"
            style={{
              border: "1px solid rgba(16, 185, 129, 0.28)",
              backgroundColor: "#fffdfb",
            }}
          >
            <div
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:justify-start sm:px-5"
              style={{
                backgroundColor: "#ecfdf5",
                borderBottom: "1px solid rgba(16, 185, 129, 0.22)",
              }}
            >
              <span aria-hidden className="text-base">
                ☕
              </span>
              <span
                className="text-[11px] font-bold uppercase tracking-[0.2em] sm:text-xs"
                style={{ color: "#047857" }}
              >
                {t("home.rewardPartnerBadge")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5">
              <a
                href={COFIBLOCKS_STORE_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-xl bg-white p-2 transition-opacity hover:opacity-90"
                style={{ border: "1px solid rgba(16, 185, 129, 0.3)" }}
              >
                <Image
                  src="/partners/cofiblocks-v2.png"
                  alt={t("footer.altCofiblocks")}
                  width={120}
                  height={120}
                  className="h-14 w-auto object-contain sm:h-16"
                  sizes="(max-width:640px) 120px, 140px"
                />
              </a>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-pretty text-sm font-medium leading-relaxed text-[#0A0908] sm:text-[15px] sm:leading-relaxed">
                  {t("home.reward")}
                </p>
                <a
                  href={COFIBLOCKS_STORE_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-bold underline-offset-2 hover:underline"
                  style={{ color: "#047857" }}
                >
                  {t("home.rewardStoreLink")}
                  <span aria-hidden className="text-xs">
                    ↗
                  </span>
                </a>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onStart}
            className="cavos-btn-primary mt-8 inline-flex min-h-12 min-w-[min(100%,200px)] items-center justify-center px-8 py-3.5 text-sm sm:mt-10 sm:min-h-0 sm:px-10 sm:py-4 sm:text-base"
          >
            {t("home.start")}
          </button>
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
