import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "@/i18n/config";
import { ar } from "@/i18n/dictionaries/ar";
import { en, type Dictionary } from "@/i18n/dictionaries/en";

const dictionaries: Record<Locale, Dictionary> = { en, ar };

/** Validates a `[lang]` route param (unknown values 404) and returns it with its dictionary. */
export async function getLocale(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return { lang, t: dictionaries[lang] };
}

export const getDictionary = (lang: Locale) => dictionaries[lang];
export type { Dictionary };
