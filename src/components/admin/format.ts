import type { Locale } from "@/i18n/config";

// Arabic dates keep Latin digits to match the rest of the admin.
const formats: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Cairo" }),
  ar: new Intl.DateTimeFormat("ar-EG-u-nu-latn", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Cairo" }),
};

export function formatDate(value: string | null, lang: Locale) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : formats[lang].format(date);
}
