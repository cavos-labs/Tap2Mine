"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GameSession } from "@/components/game-session";
import { LanguageToggle } from "@/components/language-toggle";
import { useI18n } from "@/context/locale-context";
import { usePlayer } from "@/context/player-context";

export default function GamePage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = usePlayer();

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-[var(--cavos-subtle)]">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="mobile-safe-top sticky top-0 z-30 border-b border-[var(--cavos-border)] bg-white/95 px-3 py-2.5 backdrop-blur-md sm:px-6 sm:py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
          <Link
            href="/"
            className="rounded-full px-2.5 py-1 text-xs font-semibold text-[var(--cavos-subtle)] transition-colors hover:text-[#0A0908] sm:text-sm"
          >
            {t("nav.home")}
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <span className="max-w-[7.5rem] truncate rounded-full border border-[var(--cavos-border)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#120c08] sm:max-w-none sm:px-3 sm:py-1.5 sm:text-xs">
              @{user.username}
            </span>
          </div>
        </div>
      </header>
      <main className="mobile-safe-bottom relative z-10 mx-auto flex w-full max-w-lg flex-1 items-stretch justify-center px-2 py-3 sm:px-6 sm:py-4">
        <GameSession />
      </main>
    </div>
  );
}
