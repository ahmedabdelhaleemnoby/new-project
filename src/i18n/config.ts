// Locale settings shared by server and client code.
// English is served on unprefixed URLs (rewritten to /en by src/proxy.ts); Arabic lives under /ar.
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);
export const dirOf = (lang: Locale) => (lang === "ar" ? "rtl" : "ltr");

/** Public URL for an internal path, e.g. localePath("ar", "/products") → "/ar/products". */
export function localePath(lang: Locale, path: string) {
  if (lang === defaultLocale) return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/** Strips the locale prefix from a public pathname: "/ar/products" → "/products". */
export function stripLocale(pathname: string) {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

/** Replaces {name} placeholders in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
}
