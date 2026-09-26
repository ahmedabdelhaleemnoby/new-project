import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "@/i18n/config";
import { ar } from "@/i18n/dictionaries/ar";
import { en, type Dictionary } from "@/i18n/dictionaries/en";
import { getContentOverrides } from "@/lib/content";

const dictionaries: Record<Locale, Dictionary> = { en, ar };

/** The built-in dictionary, without dashboard edits (used by the admin UI and server actions). */
export const getDictionary = (lang: Locale) => dictionaries[lang];

/** Sections staff can edit from the dashboard's page-text editor; `admin` and `cms` are the dashboard's own UI. */
export const EDITABLE_SECTIONS = Object.keys(en).filter(section => section !== "admin" && section !== "cms");

/** Flattens a dictionary into `section.key.0` paths → strings (arrays use numeric segments). */
export function flattenDictionary(dict: Dictionary): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (value: unknown, path: string) => {
    if (typeof value === "string") out[path] = value;
    else if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${path}.${i}`));
    else if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) walk(item, path ? `${path}.${key}` : key);
  };
  for (const section of EDITABLE_SECTIONS) walk(dict[section as keyof Dictionary], section);
  return out;
}

/** Applies dashboard overrides. Only existing string paths are replaced, so the dictionary shape never changes. */
function applyOverrides(base: Dictionary, overrides: Record<string, string>): Dictionary {
  const keys = Object.keys(overrides);
  if (!keys.length) return base;
  const result = structuredClone(base);
  for (const key of keys) {
    const parts = key.split(".");
    if (!EDITABLE_SECTIONS.includes(parts[0])) continue;
    let node: unknown = result;
    for (const part of parts.slice(0, -1)) node = node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined;
    const last = parts[parts.length - 1];
    if (node && typeof node === "object" && typeof (node as Record<string, unknown>)[last] === "string") (node as Record<string, unknown>)[last] = overrides[key];
  }
  return result;
}

/** The site dictionary with dashboard page-text edits applied. */
export async function getSiteDictionary(lang: Locale) {
  return applyOverrides(dictionaries[lang], await getContentOverrides(lang));
}

/** Validates a `[lang]` route param (unknown values 404) and returns it with the site dictionary. */
export async function getLocale(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return { lang, t: await getSiteDictionary(lang) };
}

export type { Dictionary };
