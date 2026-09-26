"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { hasLocale, localePath, type Locale } from "@/i18n/config";
import { flattenDictionary, getDictionary } from "@/i18n/dictionaries";
import { CONTENT_TAG } from "@/lib/content";
import { AdminApiError, adminErrorMessage, adminFetch, adminSend, adminUpload, isNotReady, type MediaItem, type PageMeta } from "@/lib/admin-api";

// Dashboard content actions (docs/BACKEND_CMS_SPEC.md §3). Forms send their record as JSON in a `payload`
// field; the backend validates it and 422 field errors come back keyed by dot path (e.g. "name.ar").
// Every successful write expires the site's content cache so changes appear on the next page load.

export type CmsState = { ok?: boolean; message?: string; fields?: Record<string, string>; notReady?: boolean } | null;

const safeLocale = (lang: string): Locale => (hasLocale(lang) ? lang : "en");

function failure(error: unknown, lang: Locale): CmsState {
  if (!(error instanceof AdminApiError)) throw error;
  const t = getDictionary(lang);
  if (isNotReady(error)) return { ok: false, notReady: true, message: t.cms.notReadyTitle };
  const fields = Object.fromEntries(Object.entries(error.fields).map(([key, message]) => [key, lang === "en" && message ? message : t.cms.invalid]));
  return { ok: false, message: error.status === 422 ? t.cms.fixErrors : adminErrorMessage(error, lang, t.admin), fields };
}

function readPayload(formData: FormData): Record<string, unknown> | null {
  try {
    const value = JSON.parse(String(formData.get("payload") ?? ""));
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

function saved(lang: Locale): CmsState {
  updateTag(CONTENT_TAG);
  return { ok: true, message: getDictionary(lang).cms.saved };
}

/** Create (id null) or update a product or sector, then return to its list after creating. */
async function saveRecord(kind: "products" | "industries", listPath: string, rawLang: string, id: number | null, formData: FormData): Promise<CmsState> {
  const lang = safeLocale(rawLang);
  const payload = readPayload(formData);
  if (!payload) return { ok: false, message: getDictionary(lang).cms.fixErrors };
  try {
    await adminFetch(lang, id ? `/admin/${kind}/${id}` : `/admin/${kind}`, { method: id ? "PATCH" : "POST", body: payload });
  } catch (error) {
    return failure(error, lang);
  }
  if (!id) {
    updateTag(CONTENT_TAG);
    redirect(localePath(lang, listPath));
  }
  return saved(lang);
}

async function deleteRecord(kind: "products" | "industries", listPath: string, rawLang: string, id: number): Promise<CmsState> {
  const lang = safeLocale(rawLang);
  try {
    await adminSend(lang, `/admin/${kind}/${id}`, { method: "DELETE" });
  } catch (error) {
    return failure(error, lang);
  }
  updateTag(CONTENT_TAG);
  redirect(localePath(lang, listPath));
}

export async function saveProductAction(lang: string, id: number | null, _: CmsState, formData: FormData) {
  return saveRecord("products", "/admin/products", lang, id, formData);
}
export async function deleteProductAction(lang: string, id: number, _: CmsState) {
  return deleteRecord("products", "/admin/products", lang, id);
}
export async function saveIndustryAction(lang: string, id: number | null, _: CmsState, formData: FormData) {
  return saveRecord("industries", "/admin/sectors", lang, id, formData);
}
export async function deleteIndustryAction(lang: string, id: number, _: CmsState) {
  return deleteRecord("industries", "/admin/sectors", lang, id);
}

/** Page text: payload is `{ en: { key: value | null }, ar: { … } }`; null restores the built-in text. */
export async function saveContentAction(rawLang: string, _: CmsState, formData: FormData): Promise<CmsState> {
  const lang = safeLocale(rawLang);
  const payload = readPayload(formData);
  if (!payload) return { ok: false, message: getDictionary(lang).cms.fixErrors };
  const allowed = new Set(Object.keys(flattenDictionary(getDictionary("en"))));
  try {
    for (const locale of ["en", "ar"] as const) {
      const changes = payload[locale];
      if (!changes || typeof changes !== "object") continue;
      const values = Object.fromEntries(Object.entries(changes).filter(([key, value]) => allowed.has(key) && (value === null || typeof value === "string")));
      if (Object.keys(values).length) await adminFetch(lang, "/admin/content", { method: "PUT", body: { locale, values } });
    }
  } catch (error) {
    return failure(error, lang);
  }
  return saved(lang);
}

export async function saveSettingsAction(rawLang: string, _: CmsState, formData: FormData): Promise<CmsState> {
  const lang = safeLocale(rawLang);
  const payload = readPayload(formData);
  if (!payload) return { ok: false, message: getDictionary(lang).cms.fixErrors };
  try {
    await adminFetch(lang, "/admin/settings", { method: "PATCH", body: payload });
  } catch (error) {
    return failure(error, lang);
  }
  return saved(lang);
}

// ---- Media library ----

export type MediaPage = { ok: true; items: MediaItem[]; meta: PageMeta } | { ok: false; notReady?: boolean; message: string };

export async function listMediaAction(rawLang: string, type: "" | "image" | "pdf", page: number, search = ""): Promise<MediaPage> {
  const lang = safeLocale(rawLang);
  const query = new URLSearchParams({ page: String(Math.max(1, page)) });
  if (type) query.set("type", type);
  if (search.trim()) query.set("search", search.trim().slice(0, 120));
  try {
    const result = await adminFetch<{ data: MediaItem[]; meta: PageMeta }>(lang, `/admin/media?${query}`);
    return { ok: true, items: result.data, meta: result.meta };
  } catch (error) {
    const state = failure(error, lang);
    return { ok: false, notReady: state?.notReady, message: state?.message ?? "" };
  }
}

const MAX_BYTES = { image: 10 * 1024 * 1024, pdf: 20 * 1024 * 1024 };
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type UploadResult = { ok: true; item: MediaItem } | { ok: false; notReady?: boolean; message: string };

export async function uploadMediaAction(rawLang: string, formData: FormData): Promise<UploadResult> {
  const lang = safeLocale(rawLang);
  const t = getDictionary(lang).cms.media;
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) return { ok: false, message: getDictionary(lang).cms.invalid };
  const kind = IMAGE_TYPES.includes(file.type) ? "image" : file.type === "application/pdf" ? "pdf" : null;
  if (!kind) return { ok: false, message: t.badType.replace("{name}", file.name) };
  if (file.size > MAX_BYTES[kind]) return { ok: false, message: t.tooLarge.replace("{name}", file.name) };
  const body = new FormData();
  body.set("file", file, file.name);
  try {
    const result = await adminUpload<{ data: MediaItem }>(lang, "/admin/media", body);
    return { ok: true, item: result.data };
  } catch (error) {
    const state = failure(error, lang);
    return { ok: false, notReady: state?.notReady, message: state?.message ?? "" };
  }
}

export async function deleteMediaAction(rawLang: string, id: number): Promise<CmsState> {
  const lang = safeLocale(rawLang);
  try {
    await adminSend(lang, `/admin/media/${id}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 409) return { ok: false, message: getDictionary(lang).cms.media.inUse };
    return failure(error, lang);
  }
  return { ok: true };
}

// ---- Staff ----

export async function saveStaffAction(rawLang: string, id: number | null, _: CmsState, formData: FormData): Promise<CmsState> {
  const lang = safeLocale(rawLang);
  const payload = readPayload(formData);
  if (!payload) return { ok: false, message: getDictionary(lang).cms.fixErrors };
  if (payload.password === "") delete payload.password;
  try {
    await adminFetch(lang, id ? `/admin/staff/${id}` : "/admin/staff", { method: id ? "PATCH" : "POST", body: payload });
  } catch (error) {
    return failure(error, lang);
  }
  redirect(localePath(lang, "/admin/staff"));
}

export async function setStaffActiveAction(rawLang: string, id: number, active: boolean, _: CmsState): Promise<CmsState> {
  const lang = safeLocale(rawLang);
  try {
    await adminFetch(lang, `/admin/staff/${id}`, { method: "PATCH", body: { active } });
  } catch (error) {
    return failure(error, lang);
  }
  redirect(localePath(lang, "/admin/staff"));
}
