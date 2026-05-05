"use client";

import { useEffect, useState } from "react";
import {
  registerUsernameIfNew,
  resolveRegisteredUsername,
} from "@/lib/storage";
import { useI18n } from "@/context/locale-context";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (username: string) => void;
};

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function AuthModal({ open, onClose, onAuthenticated }: AuthModalProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<"provider" | "username">("provider");
  const [provider, setProvider] = useState<"apple" | "google" | null>(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep("provider");
    setProvider(null);
    setUsername("");
  }, [open]);

  if (!open) return null;

  const finish = () => {
    const u = username.trim();
    if (u.length < 2) return;
    const existing = resolveRegisteredUsername(u);
    if (existing) {
      onAuthenticated(existing);
    } else {
      registerUsernameIfNew(u);
      onAuthenticated(u);
    }
    setUsername("");
    onClose();
  };

  return (
    <div
      className="mobile-safe-bottom fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-heading"
    >
      <div className="card relative w-full max-w-sm px-6 py-8 sm:px-7 sm:py-9">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-[var(--cavos-subtle)] transition-colors hover:bg-black/5 hover:text-[#0A0908]"
          aria-label={t("common.close")}
        >
          <span className="block h-4 w-4 leading-none">×</span>
        </button>

        {step === "provider" && (
          <div className="flex flex-col items-center gap-6 pt-1">
            <div className="text-center">
              <span className="eyebrow">{t("auth.eyebrow")}</span>
              <h2
                id="auth-heading"
                className="mt-3 text-xl font-semibold tracking-tight text-[#120c08]"
              >
                {t("auth.signIn")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--cavos-muted)]">
                {t("auth.providerCopy")}
              </p>
            </div>
            <div className="flex items-center justify-center gap-5 sm:gap-6">
              <button
                type="button"
                aria-label={t("auth.continueApple")}
                onClick={() => {
                  setProvider("apple");
                  setStep("username");
                }}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--cavos-border)] bg-white text-[#0A0908] transition-colors hover:border-[var(--cavos-border-strong)] hover:bg-[var(--cavos-surface-quiet)] sm:h-15 sm:w-15"
              >
                <AppleIcon className="h-7 w-7" />
              </button>
              <button
                type="button"
                aria-label={t("auth.continueGoogle")}
                onClick={() => {
                  setProvider("google");
                  setStep("username");
                }}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--cavos-border)] bg-white transition-colors hover:border-[var(--cavos-border-strong)] hover:bg-[var(--cavos-surface-quiet)] sm:h-15 sm:w-15"
              >
                <GoogleIcon className="h-7 w-7" />
              </button>
            </div>
          </div>
        )}

        {step === "username" && (
          <div className="flex flex-col gap-4 pt-1">
            <button
              type="button"
              onClick={() => {
                setStep("provider");
                setProvider(null);
              }}
              className="self-start rounded-full px-2.5 py-1 text-xs font-semibold text-[var(--cavos-subtle)] transition-colors hover:text-[#0A0908]"
            >
              ← {t("auth.back")}
            </button>
            <div>
              <span className="eyebrow">
                {provider === "apple" ? "Apple" : "Google"}
              </span>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-[#120c08]">
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
                if (e.key === "Enter") finish();
              }}
              placeholder={t("auth.placeholder")}
              autoComplete="username"
              autoFocus
              className="h-12 w-full rounded-xl border border-[var(--cavos-border)] bg-white px-3 text-base text-[#0A0908] placeholder:text-[var(--cavos-subtle)] focus:border-[var(--cavos-border-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(247,147,26,0.2)] sm:text-[15px]"
            />
            <button
              type="button"
              onClick={finish}
              className="cavos-btn-primary h-12 text-sm font-semibold sm:text-base"
            >
              {t("auth.continue")}
            </button>
            <p className="sr-only" aria-live="polite">
              {provider === "apple" ? "Apple" : "Google"} (placeholder)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
