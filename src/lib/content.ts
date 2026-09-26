// Site content from the content API, with the data bundled in this project as the fallback.
// Proposed public endpoints (GET, `?locale=en|ar`, JSON array or Laravel-style `{ "data": [...] }`):
//   /products         → Product[]      (src/lib/data.ts)
//   /industries       → Industry[]     (src/lib/data.ts)
//   /menus/products   → MenuFamily[]   (src/lib/menu.ts; locally derived from the products, without datasheets)
//   /menus/sectors    → Datasheet[]    (src/lib/menu.ts; locally empty, so the header links to the sectors page)
// A null, empty, invalid, or failed response uses the local list. Items that match a local item
// (by slug, or by URL for sector brochures) get null or missing fields filled from the local copy.
// Server-only: call from Server Components and pass the results to Client Components as props.
import type { Locale } from "@/i18n/config";
import { localIndustries, localProducts, type Industry, type Product } from "@/lib/data";
import type { Datasheet, MenuFamily } from "@/lib/menu";

const CONTENT_API_URL = (process.env.CONTENT_API_URL ?? process.env.NEXT_PUBLIC_ENQUIRY_API_URL ?? "https://project2.gfoura.com/api/v1").replace(/\/$/, "");
const REVALIDATE_SECONDS = 300;

type Row = Record<string, unknown>;
const isRecord = (value: unknown): value is Row => typeof value === "object" && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === "string" && value.trim() !== "";
const isSheet = (value: unknown): value is Datasheet => isRecord(value) && isText(value.label) && isText(value.url);

const isProduct = (p: Row): boolean =>
  isText(p.slug) && isText(p.name) && (p.category === "Shaped" || p.category === "Unshaped") && isText(p.short) && isText(p.description) && isText(p.image)
  && Array.isArray(p.grades) && p.grades.every(isText) && (p.datasheet === undefined || isSheet(p.datasheet));
const isIndustry = (i: Row): boolean => isText(i.slug) && isText(i.name) && isText(i.text) && isText(i.icon);
const isMenuFamily = (f: Row): boolean =>
  isText(f.slug) && isText(f.name) && (f.category === "Shaped" || f.category === "Unshaped") && Array.isArray(f.groups)
  && f.groups.every(g => isRecord(g) && (g.name === null || isText(g.name)) && Array.isArray(g.sheets) && g.sheets.every(isSheet));

async function fetchRows(path: string, lang: Locale): Promise<unknown[] | null> {
  try {
    const response = await fetch(`${CONTENT_API_URL}${path}?locale=${lang}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS, tags: ["content"] },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    const rows = isRecord(body) ? body.data : body;
    return Array.isArray(rows) ? rows : null;
  } catch {
    return null;
  }
}

async function load<T extends object>(path: string, lang: Locale, local: T[], key: keyof T & string, isValid: (row: Row) => boolean): Promise<T[]> {
  const rows = await fetchRows(path, lang);
  if (!rows?.length) return local;
  const merged = rows.filter(isRecord).map(row => {
    const fallback = local.find(item => (item as Row)[key] === row[key]) ?? {};
    const present = Object.fromEntries(Object.entries(row).filter(([, value]) => value !== null && value !== undefined));
    return { ...fallback, ...present } as Row;
  });
  const valid = merged.filter(isValid) as T[];
  return valid.length ? valid : local;
}

export const getProducts = (lang: Locale) => load<Product>("/products", lang, localProducts(lang), "slug", isProduct);
export const getIndustries = (lang: Locale) => load<Industry>("/industries", lang, localIndustries(lang), "slug", isIndustry);
export async function getProductMenu(lang: Locale) {
  const local: MenuFamily[] = (await getProducts(lang)).map(({ slug, name, category }) => ({ slug, name, category, groups: [] }));
  return load<MenuFamily>("/menus/products", lang, local, "slug", isMenuFamily);
}
export const getSectorMenu = (lang: Locale) => load<Datasheet>("/menus/sectors", lang, [], "url", isSheet);
