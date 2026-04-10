"use client";

import { useEffect, useState } from "react";
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
  const { t, intlLocale } = useI18n();
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

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-black/40">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-[#EAE5DC] bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-black/45 transition-colors hover:text-[#0A0908]"
          >
            {t("nav.home")}
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <span className="text-sm font-semibold text-[#0A0908]">
              @{user.username}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10">
        <section
          className="rounded-2xl border border-black/5 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6"
          style={{ backgroundColor: "#f0ece6" }}
        >
          <h1 className="text-lg font-bold text-[#0A0908] sm:text-xl">
            {t("player.title")}
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-black/40">
            {t("player.bestRound")}
          </p>

          <div className="mt-6 flex flex-col gap-1">
            <p className="text-3xl font-bold tabular-nums tracking-tight text-[#0A0908] sm:text-5xl">
              {formatImaginaryBtc(highScoreTaps, intlLocale)}
            </p>
            {priceUsd != null && (
              <p
                className="text-xl font-extrabold tabular-nums sm:text-2xl"
                style={{ color: "#059669" }}
              >
                ≈ {formatUsd(highScoreTaps, priceUsd, intlLocale)}
              </p>
            )}
            <p className="mt-0.5 text-xs tabular-nums text-black/30">
              {highScoreTaps.toLocaleString(intlLocale)} {t("common.taps")}
            </p>
          </div>

          <Link
            href="/game"
            className="cavos-btn-primary mt-8 inline-flex items-center justify-center px-8 py-3 text-sm font-semibold"
          >
            {t("player.newGame")}
          </Link>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-black/5 bg-[#F7F5F2] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6">
          <h2 className="mb-1 text-sm font-semibold tracking-wide text-[#0A0908]">
            {t("player.recentGames")}
          </h2>

          <div
            className="mb-3 mt-4 hidden border-b border-black/5 px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-black/35 sm:grid"
            style={{
              gridTemplateColumns: "minmax(0,1fr) auto auto auto",
              gap: "0 0.75rem",
            }}
          >
            <span>{t("player.colDate")}</span>
            <span className="text-right">{t("common.taps")}</span>
            <span className="text-right" style={{ color: "#b45309" }}>
              {t("common.btc")}
            </span>
            <span className="text-right" style={{ color: "#047857" }}>
              USD ~
            </span>
          </div>

          {history.length === 0 ? (
            <p className="mt-4 text-sm text-black/40">{t("player.noGames")}</p>
          ) : (
            <ul className="space-y-2">
              {history.slice(0, 12).map((g) => (
                <li
                  key={g.id}
                  className="rounded-xl border border-black/5 bg-white/65 px-3 py-3 text-sm font-medium transition-colors duration-200 hover:bg-white/95 sm:grid sm:items-center sm:gap-x-3"
                  style={{
                    gridTemplateColumns: "minmax(0,1fr) auto auto auto",
                  }}
                >
                  <span className="mb-2 block tabular-nums text-black/40 sm:mb-0">
                    {new Date(g.playedAt).toLocaleString(intlLocale, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                  <span className="mb-1 block text-right tabular-nums font-semibold text-[#0A0908] sm:mb-0">
                    {g.taps.toLocaleString(intlLocale)} {t("common.taps")}
                  </span>
                  <div className="flex justify-end sm:mb-0">
                    <span
                      className="inline-block text-[13px] sm:text-sm"
                      style={{
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                        border: "1px solid rgba(217, 119, 6, 0.45)",
                        borderRadius: "0.5rem",
                        padding: "0.25rem 0.625rem",
                        fontWeight: 800,
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.25,
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 10px rgba(217, 119, 6, 0.15)",
                      }}
                    >
                      {formatImaginaryBtc(g.btcMined, intlLocale)}
                    </span>
                  </div>
                  <div className="flex justify-end sm:mb-0">
                    {priceUsd != null ? (
                      <span
                        className="inline-block text-[13px] sm:text-sm"
                        style={{
                          backgroundColor: "#d1fae5",
                          color: "#047857",
                          border: "1px solid rgba(16, 185, 129, 0.55)",
                          borderRadius: "0.5rem",
                          padding: "0.25rem 0.625rem",
                          fontWeight: 800,
                          fontVariantNumeric: "tabular-nums",
                          letterSpacing: "-0.02em",
                          lineHeight: 1.25,
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.65), 0 2px 10px rgba(5, 150, 105, 0.2)",
                        }}
                      >
                        {formatUsd(g.btcMined, priceUsd, intlLocale)}
                      </span>
                    ) : (
                      <span className="tabular-nums text-black/30">—</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="cavos-btn-secondary py-3 text-sm"
        >
          {t("player.logOut")}
        </button>
      </main>
    </div>
  );
}
