"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/context/locale-context";
import { usePlayer } from "@/context/player-context";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (username: string) => Promise<void>;
};

export function AuthModal({ open, onClose, onAuthenticated }: AuthModalProps) {
  const { t } = useI18n();
  const { isLoading, walletAddress, walletStatus } = usePlayer();
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setUsername("");
    setError(null);
  }, [open]);

  if (!open) return null;

  const finish = async () => {
    const u = username.trim();
    if (u.length < 2) return;
    setBusy(true);
    setError(null);
    try {
      await onAuthenticated(u);
      setUsername("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="mobile-safe-bottom fixed inset-0 z-50 flex items-end justify-center bg-black/68 p-3 backdrop-blur-md sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-heading"
    >
      <div className="card result-sheet relative w-full max-w-sm px-5 pb-7 pt-8 sm:px-7 sm:py-9">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 min-h-11 min-w-11 rounded-full p-2 text-[var(--cavos-subtle)] transition-colors hover:bg-white/10 hover:text-[var(--cavos-cream)]"
          aria-label={t("common.close")}
        >
          <span className="block h-4 w-4 leading-none">x</span>
        </button>

        <div className="flex flex-col gap-4 pt-1">
          <div>
            <span className="eyebrow">{t("auth.eyebrow")}</span>
            <h2
              id="auth-heading"
              className="mt-2 text-xl font-extrabold text-[var(--cavos-cream)]"
            >
              {t("common.username")}
            </h2>
            <p className="mt-1 text-sm text-[var(--cavos-muted)]">
              {t("auth.usernameCopy")}
            </p>
          </div>
          <label className="sr-only" htmlFor="auth-username">
            {t("common.username")}
          </label>
          <input
            id="auth-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void finish();
            }}
            placeholder={t("auth.placeholder")}
            autoComplete="username"
            autoFocus
            className="h-12 w-full rounded-[0.85rem] border border-[var(--cavos-border)] bg-black/24 px-3 text-base text-[var(--cavos-cream)] placeholder:text-[var(--cavos-subtle)] focus:border-[var(--cavos-border-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(247,147,26,0.24)] sm:text-[15px]"
          />
          <button
            type="button"
            disabled={busy || isLoading || !walletAddress || walletStatus.isDeploying}
            onClick={() => void finish()}
            className="cavos-btn-primary h-12 text-sm sm:text-base"
          >
            {busy ? t("common.loading") : t("auth.continue")}
          </button>
          {walletAddress && (
            <p className="text-center text-[11px] font-medium text-[var(--cavos-subtle)]">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          )}
          {error && <p className="text-center text-xs leading-5 text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
