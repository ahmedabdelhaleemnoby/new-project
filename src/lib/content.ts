// Site content from the content API, with the data bundled in this project as the fallback.
// Proposed public endpoints (GET, `?locale=en|ar`, JSON array or Laravel-style `{ "data": [...] }`):
//   /products         → Product[]      (src/lib/data.ts)
//   /industries       → Industry[]     (src/lib/data.ts)
//   /menus/products   → MenuFamily[]   (src/lib/menu.ts; locally derived from the products and their datasheet PDFs)
//   /menus/sectors    → Datasheet[]    (src/lib/menu.ts; locally empty, so the header links to the sectors page)
//   /settings         → company details and page photos (src/lib/settings.ts)
//   /content          → page-text overrides, a flat { "dictionary.key": "text" } map (src/i18n/dictionaries.ts)
// Full contract: docs/BACKEND_CMS_SPEC.md.
// A null, empty, invalid, or failed response uses the local list. Items that match a local item
// (by slug, or by URL for sector brochures) get null, missing or empty-list fields filled from the local copy,
// and site-relative image paths that don't exist in /public fall back to local photos.
// Server-only: call from Server Components and pass the results to Client Components as props.
import { existsSync } from "node:fs";
import path from "node:path";
import type { Locale } from "@/i18n/config";
import { localIndustries, localProducts, type Industry, type Product } from "@/lib/data";
import type { Datasheet, MenuFamily } from "@/lib/menu";
import { imageKeys, localSettings, type SiteSettings } from "@/lib/settings";

const CONTENT_API_URL = (process.env.CONTENT_API_URL ?? process.env.NEXT_PUBLIC_ENQUIRY_API_URL ?? "https://project2.gfoura.com/api/v1").replace(/\/$/, "");
const REVALIDATE_SECONDS = 300;
/** Cache tag for every content request; the dashboard expires it after each save. */
export const CONTENT_TAG = "content";

type Row = Record<string, unknown>;
const isRecord = (value: unknown): value is Row => typeof value === "object" && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === "string" && value.trim() !== "";
const isSheet = (value: unknown): value is Datasheet => isRecord(value) && isText(value.label) && isText(value.url);

const isSpecs = (s: unknown) => isRecord(s) && isText(s.title) && Array.isArray(s.sections)
  && s.sections.every(section => isRecord(section) && isText(section.name) && Array.isArray(section.rows)
    && section.rows.every(row => Array.isArray(row) && row.length === 2 && row.every(cell => typeof cell === "string")));
const isProduct = (p: Row): boolean =>
  isText(p.slug) && isText(p.name) && (p.category === "Shaped" || p.category === "Unshaped") && isText(p.short) && isText(p.description) && isText(p.image)
  && Array.isArray(p.grades) && p.grades.every(isText) && (p.datasheet === undefined || isSheet(p.datasheet))
  && (p.applications === undefined || (Array.isArray(p.applications) && p.applications.every(isText)))
  && (p.imageFit === undefined || p.imageFit === "cover" || p.imageFit === "contain")
  && (p.gallery === undefined || (Array.isArray(p.gallery) && p.gallery.every(isText)))
  && (p.specs === undefined || isSpecs(p.specs));
const isIndustry = (i: Row): boolean => isText(i.slug) && isText(i.name) && isText(i.text) && isText(i.icon);
const isMenuFamily = (f: Row): boolean =>
  isText(f.slug) && isText(f.name) && (f.category === "Shaped" || f.category === "Unshaped") && Array.isArray(f.groups)
  && f.groups.every(g => isRecord(g) && (g.name === null || isText(g.name)) && Array.isArray(g.sheets) && g.sheets.every(isSheet));

async function fetchJson(path: string, lang: Locale): Promise<unknown> {
  try {
    const response = await fetch(`${CONTENT_API_URL}${path}?locale=${lang}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS, tags: [CONTENT_TAG] },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    // Accept Laravel-style `{ "data": … }` envelopes or bare payloads.
    return isRecord(body) && "data" in body ? body.data : body;
  } catch {
    return null;
  }
}

async function fetchRows(path: string, lang: Locale): Promise<unknown[] | null> {
  const rows = await fetchJson(path, lang);
  return Array.isArray(rows) ? rows : null;
}

/** Site-relative paths ("/images/…") must exist in /public; absolute URLs are trusted. Results are cached. */
const fileCache = new Map<string, boolean>();
function isServable(url: string) {
  if (!url.startsWith("/")) return true;
  if (!fileCache.has(url)) fileCache.set(url, existsSync(path.join(process.cwd(), "public", decodeURIComponent(url.split("?")[0]))));
  return fileCache.get(url)!;
}
/** Used when an API product's photo is missing and no local product matches its slug. */
const DEFAULT_PRODUCT_IMAGE = "/images/catalogue/backfill.jpg";
/** The CMS's first seed: placeholder products from another company's range, retired for the Ajyad catalogue.
 *  They're dropped from API responses; a list made only of them falls back to the local catalogue. Loading the
 *  catalogue from the dashboard (Products → Load the Ajyad catalogue) removes them from the CMS. */
const RETIRED_PRODUCT_SLUGS = new Set(["lightweight-bricks", "dense-alumina-bricks", "cordierite-mullite-bricks", "chemical-bond-bricks", "acid-resistant-bricks", "castables", "mortars", "chamotte", "calcined-bauxite"]);

async function load<T extends object>(apiPath: string, lang: Locale, local: T[], key: keyof T & string, isValid: (row: Row) => boolean, retired?: Set<string>): Promise<T[]> {
  const fetched = await fetchRows(apiPath, lang);
  const rows = retired ? fetched?.filter(row => !(isRecord(row) && typeof row[key] === "string" && retired.has(row[key]))) : fetched;
  if (!rows?.length) return local;
  const merged = rows.filter(isRecord).map(row => {
    const fallback: Row = local.find(item => (item as Row)[key] === row[key]) ?? {};
    const present = Object.fromEntries(Object.entries(row).filter(([field, value]) =>
      value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0 && Array.isArray(fallback[field]) && (fallback[field] as unknown[]).length > 0)));
    const item = { ...fallback, ...present } as Row;
    if (typeof item.image === "string" && !isServable(item.image)) item.image = typeof fallback.image === "string" ? fallback.image : DEFAULT_PRODUCT_IMAGE;
    if (Array.isArray(item.gallery)) item.gallery = item.gallery.filter(url => typeof url === "string" && isServable(url));
    return item;
  });
  const valid = merged.filter(isValid) as T[];
  return valid.length ? valid : local;
}

export const getProducts = (lang: Locale) => load<Product>("/products", lang, localProducts(lang), "slug", isProduct, RETIRED_PRODUCT_SLUGS);
export const getIndustries = (lang: Locale) => load<Industry>("/industries", lang, localIndustries(lang), "slug", isIndustry);
export async function getProductMenu(lang: Locale) {
  const local: MenuFamily[] = (await getProducts(lang)).map(({ slug, name, category, grades, datasheet }) => ({
    slug, name, category,
    groups: datasheet ? [{ name: null, sheets: [{ label: grades[0] ?? name, url: datasheet.url }] }] : [],
  }));
  return load<MenuFamily>("/menus/products", lang, local, "slug", isMenuFamily, RETIRED_PRODUCT_SLUGS);
}
export const getSectorMenu = (lang: Locale) => load<Datasheet>("/menus/sectors", lang, [], "url", isSheet);

const isUrl = (value: unknown): value is string => isText(value) && (/^https?:\/\//.test(value) || value.startsWith("/"));

/** Company details and photos: each valid field from the API replaces the local default. */
export async function getSettings(lang: Locale): Promise<SiteSettings> {
  const local = localSettings(lang);
  const api = await fetchJson("/settings", lang);
  if (!isRecord(api)) return local;
  const legal = isRecord(api.legal) ? api.legal : {};
  const images = isRecord(api.images) ? api.images : {};
  const address = api.address;
  const secondary = api.secondary_email;
  return {
    name: isText(api.name) ? api.name : local.name,
    fullName: isText(api.full_name) ? api.full_name : local.fullName,
    email: isText(api.email) ? api.email : local.email,
    secondaryEmail: secondary === null ? null : isRecord(secondary) && isText(secondary.email) && isText(secondary.label) ? { email: secondary.email, label: secondary.label } : local.secondaryEmail,
    // `phone` may hold several numbers separated by commas.
    phones: api.phone === null ? [] : isText(api.phone) ? api.phone.split(/[,;]/).map(p => p.trim()).filter(Boolean) : local.phones,
    whatsappPhone: isText(api.whatsapp_phone) ? api.whatsapp_phone : isText(api.whatsapp) ? api.whatsapp : local.whatsappPhone,
    linkedinUrl: isText(api.linkedin_url) ? api.linkedin_url : isText(api.linkedin) ? api.linkedin : local.linkedinUrl,
    facebookUrl: isText(api.facebook_url) ? api.facebook_url : isText(api.facebook) ? api.facebook : local.facebookUrl,
    catalogueUrl: isUrl(api.catalogue_url) && isServable(api.catalogue_url) ? api.catalogue_url : local.catalogueUrl,
    address: address === null ? null : isRecord(address) && Array.isArray(address.lines) && address.lines.every(isText) && isUrl(address.map_url) ? { lines: address.lines, mapUrl: address.map_url } : local.address,
    legal: {
      form: isText(legal.form) ? legal.form : local.legal.form,
      commercialRegister: isText(legal.commercial_register) ? legal.commercial_register : local.legal.commercialRegister,
      taxCard: isText(legal.tax_card) ? legal.tax_card : local.legal.taxCard,
    },
    images: Object.fromEntries(imageKeys.map(key => [key, isUrl(images[key]) && isServable(images[key]) ? images[key] : local.images[key]])) as SiteSettings["images"],
  };
}

/** Page-text overrides edited in the dashboard: `{ "home.introLead": "…" }`. */
export async function getContentOverrides(lang: Locale): Promise<Record<string, string>> {
  const api = await fetchJson("/content", lang);
  if (!isRecord(api)) return {};
  return Object.fromEntries(Object.entries(api).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}
