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
      <div className="flex flex-1 items-center justify-center p-8 text-black/40">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-black/5 bg-white/90 px-4 py-2.5 backdrop-blur-sm sm:px-6 sm:py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
          <Link
            href="/player"
            className="text-sm text-black/40 transition-colors hover:text-[#0A0908]"
          >
            {t("nav.profile")}
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <span className="text-xs text-black/35">
              @{user.username}
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-3 py-6 sm:px-6">
        <GameSession />
      </main>
    </div>
  );
}
