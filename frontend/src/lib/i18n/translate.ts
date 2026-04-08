import type { Locale } from "./dictionaries";
import { dictionaries } from "./dictionaries";

/** Resolves dot paths like `game.rulesTitle` on the locale dictionary. */
export function translate(locale: Locale, path: string): string {
  const parts = path.split(".");
  let cur: unknown = dictionaries[locale];
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return path;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : path;
}

/** Replaces `{name}` placeholders in a translated string. */
export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] != null ? String(vars[key]) : `{${key}}`,
  );
}

/** BCP 47 tag for Intl formatting. */
export function intlLocaleFor(locale: Locale): string {
  return locale === "es" ? "es-ES" : "en-US";
}
