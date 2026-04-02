"use client";

import { useState } from "react";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (username: string) => void;
};

export function AuthModal({ open, onClose, onAuthenticated }: AuthModalProps) {
  const [username, setUsername] = useState("");
  const [tab, setTab] = useState<"login" | "register">("login");

  if (!open) return null;

  const submit = () => {
    const u = username.trim();
    if (u.length < 2) return;
    onAuthenticated(u);
    setUsername("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div className="btc-card w-full max-w-md border border-[var(--btc-border)] p-6 shadow-2xl shadow-orange-900/20">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="auth-title" className="font-mono text-lg text-[var(--btc-orange)]">
            {tab === "login" ? "Sign in" : "Create account"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mb-6 flex rounded-lg bg-black/40 p-1 font-mono text-sm">
          <button
            type="button"
            className={`flex-1 rounded-md py-2 transition-colors ${
              tab === "login"
                ? "bg-[var(--btc-orange)] text-black"
                : "text-zinc-400 hover:text-white"
            }`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-2 transition-colors ${
              tab === "register"
                ? "bg-[var(--btc-orange)] text-black"
                : "text-zinc-400 hover:text-white"
            }`}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>

        <p className="mb-4 text-sm text-zinc-400">
          Use a provider (placeholders) or email. Your{" "}
          <span className="text-[var(--btc-orange)]">username</span> is what
          appears on the leaderboard.
        </p>

        <label className="mb-4 block font-mono text-xs uppercase tracking-wider text-zinc-500">
          Leaderboard username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your_nickname"
            className="mt-2 w-full rounded-lg border border-[var(--btc-border)] bg-black/50 px-4 py-3 font-sans text-base text-white placeholder:text-zinc-600 focus:border-[var(--btc-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--btc-orange)]"
            autoComplete="username"
          />
        </label>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="btc-btn-secondary flex items-center justify-center gap-2 py-3 font-mono text-sm"
            onClick={submit}
          >
            Apple (coming soon)
          </button>
          <button
            type="button"
            className="btc-btn-secondary flex items-center justify-center gap-2 py-3 font-mono text-sm"
            onClick={submit}
          >
            <span className="text-[var(--btc-orange)]">G</span> Google (coming
            soon)
          </button>
          <button
            type="button"
            className="btc-btn-primary py-3 font-mono text-sm font-semibold"
            onClick={submit}
          >
            Email — continue (mock)
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-600">
          Real auth will plug in later; this only validates the UI flow.
        </p>
      </div>
    </div>
  );
}
