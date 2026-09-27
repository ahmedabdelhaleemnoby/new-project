// Loads the built-in Ajyad catalogue (src/lib/data.ts, public/catalogue, public/images/catalogue) into the CMS
// through the admin API: uploads photos and PDFs to the media library, replaces the products, updates the
// company settings, and clears page-text overrides. Server-only; run from the dashboard by a signed-in admin.
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/i18n/config";
import { adminFetch, adminSend, adminUpload, type AdminProduct, type MediaItem } from "@/lib/admin-api";
import { CATALOGUE_PDF, localProducts } from "@/lib/data";
import { defaultImages } from "@/lib/settings";
import { site } from "@/lib/site";

export type ImportReport = { uploaded: number; reused: number; created: number; updated: number; deleted: number; clearedTexts: number };

const MIME: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".pdf": "application/pdf" };

/** Uploads a file from /public once per import, reusing a library item with the same filename if one exists. */
function mediaUploader(lang: Locale, report: ImportReport) {
  const cache = new Map<string, string>();
  return async (publicPath: string) => {
    if (cache.has(publicPath)) return cache.get(publicPath)!;
    const filename = path.basename(publicPath);
    const existing = await adminFetch<{ data: MediaItem[] }>(lang, `/admin/media?search=${encodeURIComponent(filename)}&page=1`);
    const match = existing.data.find(item => item.filename === filename);
    let url: string;
    if (match) {
      url = match.url;
      report.reused++;
    } else {
      const bytes = await readFile(path.join(process.cwd(), "public", publicPath));
      const body = new FormData();
      body.set("file", new File([bytes], filename, { type: MIME[path.extname(filename).toLowerCase()] ?? "application/octet-stream" }));
      url = (await adminUpload<{ data: MediaItem }>(lang, "/admin/media", body)).data.url;
      report.uploaded++;
    }
    cache.set(publicPath, url);
    return url;
  };
}

/** Bilingual product records for the admin API (docs/BACKEND_CMS_SPEC.md §3.1), with media URLs substituted. */
async function productPayloads(upload: (publicPath: string) => Promise<string>) {
  const en = localProducts("en");
  const ar = localProducts("ar");
  const payloads: Omit<AdminProduct, "id">[] = [];
  for (const [i, p] of en.entries()) {
    const a = ar[i];
    const pdf = p.datasheet ? await upload(p.datasheet.url) : null;
    payloads.push({
      slug: p.slug,
      category: p.category,
      sort_order: i + 1,
      published: true,
      image: await upload(p.image),
      name: { en: p.name, ar: a.name },
      short: { en: p.short, ar: a.short },
      description: { en: p.description, ar: a.description },
      grades: p.grades,
      featured_datasheet: pdf && p.datasheet && a.datasheet ? { label: { en: p.datasheet.label, ar: a.datasheet.label }, url: pdf } : null,
      datasheet_groups: pdf ? [{ name: null, sheets: [{ label: p.grades[0] ?? p.name, url: pdf }] }] : [],
      applications: (p.applications ?? []).map((text, j) => ({ en: text, ar: a.applications?.[j] ?? text })),
      specs: p.specs && a.specs ? {
        title: p.specs.title,
        sections: p.specs.sections.map((section, j) => ({
          name: { en: section.name, ar: a.specs!.sections[j].name },
          rows: section.rows.map(([label, value], k) => ({ label: { en: label, ar: a.specs!.sections[j].rows[k][0] }, value: { en: value, ar: a.specs!.sections[j].rows[k][1] } })),
        })),
      } : null,
    });
  }
  return payloads;
}

export async function importCatalogue(lang: Locale): Promise<ImportReport> {
  const report: ImportReport = { uploaded: 0, reused: 0, created: 0, updated: 0, deleted: 0, clearedTexts: 0 };
  const upload = mediaUploader(lang, report);

  // 1. Products: update matching slugs, create new ones, delete products that aren't in the catalogue.
  const payloads = await productPayloads(upload);
  const current = (await adminFetch<{ data: AdminProduct[] }>(lang, "/admin/products")).data;
  const wanted = new Set(payloads.map(p => p.slug));
  for (const old of current.filter(p => !wanted.has(p.slug))) {
    await adminSend(lang, `/admin/products/${old.id}`, { method: "DELETE" });
    report.deleted++;
  }
  for (const payload of payloads) {
    const existing = current.find(p => p.slug === payload.slug);
    if (existing) {
      await adminFetch(lang, `/admin/products/${existing.id}`, { method: "PATCH", body: payload });
      report.updated++;
    } else {
      await adminFetch(lang, "/admin/products", { method: "POST", body: payload });
      report.created++;
    }
  }

  // 2. Company settings: phones, catalogue PDF, and the page photos.
  const images: Record<string, string> = {};
  for (const [key, publicPath] of Object.entries(defaultImages)) images[key] = await upload(publicPath);
  await adminFetch(lang, "/admin/settings", { method: "PATCH", body: { phone: site.phones.join(", "), catalogue_url: await upload(CATALOGUE_PDF), images } });

  // 3. Page text: remove overrides so the site's current wording applies (staff can edit again afterwards).
  const overrides = (await adminFetch<{ data: { en?: Record<string, string>; ar?: Record<string, string> } }>(lang, "/admin/content")).data;
  for (const locale of ["en", "ar"] as const) {
    const keys = Object.keys(overrides[locale] ?? {});
    if (!keys.length) continue;
    await adminFetch(lang, "/admin/content", { method: "PUT", body: { locale, values: Object.fromEntries(keys.map(key => [key, null])) } });
    report.clearedTexts += keys.length;
  }

  return report;
}
