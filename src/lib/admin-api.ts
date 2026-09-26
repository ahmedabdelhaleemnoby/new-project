// Server-only client for the staff endpoints of the enquiry API (bearer token auth).
// The token lives in an httpOnly cookie and is never sent to the browser.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Staff } from "@/lib/admin-shared";
import { site } from "@/lib/site";

export * from "@/lib/admin-shared";

const ADMIN_API_URL = (process.env.ADMIN_API_URL ?? process.env.NEXT_PUBLIC_ENQUIRY_API_URL ?? "https://project2.gfoura.com/api/v1").replace(/\/$/, "");
export const TOKEN_COOKIE = "ajyad_admin_token";

/** `status` 0 means the API could not be reached. `apiMessage` is the API's own (English) message, if any. */
export class AdminApiError extends Error {
  constructor(public status: number, public apiMessage: string | null = null, public fields: Record<string, string> = {}) { super(apiMessage ?? `Admin API error ${status}`); }
}

/** The endpoint doesn't exist yet on the backend (see docs/BACKEND_CMS_SPEC.md). */
export const isNotReady = (error: unknown) => error instanceof AdminApiError && (error.status === 404 || error.status === 405 || error.status === 501);

/** Local company name for dashboard chrome (the logo alt text). */
export const adminBrandName = (lang: Locale) => site.fullName[lang];

/** User-facing message for an admin API error: the API's English message on English pages, otherwise a localized one. */
export function adminErrorMessage(error: AdminApiError, lang: Locale, t: Dictionary["admin"]) {
  if (lang === "en" && error.apiMessage) return error.apiMessage;
  if (error.status === 0) return t.unreachable;
  if (error.status === 401) return t.invalidCredentials;
  if (error.status === 403) return t.forbidden;
  if (error.status >= 500) return t.unavailable;
  return t.requestFailed;
}

async function errorFrom(response: Response) {
  let body: { message?: string; error?: { message?: string }; errors?: Record<string, string[]> } = {};
  try { body = await response.json(); } catch {}
  const fields = Object.fromEntries(Object.entries(body.errors ?? {}).map(([key, messages]) => [key, messages[0] ?? ""]));
  return new AdminApiError(response.status, body.error?.message ?? body.message ?? null, fields);
}

export async function getToken() {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

/** Authenticated JSON request. A missing or rejected token sends the user to the login page for `lang`. */
export async function adminFetch<T>(lang: Locale, path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  return (await adminSend(lang, path, { method: init.method ?? "GET", body: init.body })) as T;
}

/** Multipart upload (media library). The file passes through the Next server, so no browser CORS is involved. */
export async function adminUpload<T>(lang: Locale, path: string, body: FormData): Promise<T> {
  const token = await getToken();
  if (!token) redirect(localePath(lang, "/admin/login"));
  let response: Response;
  try {
    response = await fetch(`${ADMIN_API_URL}${path}`, { method: "POST", headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, body, cache: "no-store", signal: AbortSignal.timeout(60000) });
  } catch {
    throw new AdminApiError(0);
  }
  if (response.status === 401) redirect(localePath(lang, "/admin/login?expired=1"));
  if (!response.ok) throw await errorFrom(response);
  return response.json() as Promise<T>;
}

/** Requests that may return 204 No Content (deletes). */
export async function adminSend(lang: Locale, path: string, init: { method: string; body?: unknown }): Promise<unknown> {
  const token = await getToken();
  if (!token) redirect(localePath(lang, "/admin/login"));
  let response: Response;
  try {
    response = await fetch(`${ADMIN_API_URL}${path}`, {
      method: init.method,
      headers: { Accept: "application/json", Authorization: `Bearer ${token}`, ...(init.body ? { "Content-Type": "application/json" } : {}) },
      body: init.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new AdminApiError(0);
  }
  if (response.status === 401) redirect(localePath(lang, "/admin/login?expired=1"));
  if (!response.ok) throw await errorFrom(response);
  return response.status === 204 ? null : response.json().catch(() => null);
}

export async function login(email: string, password: string): Promise<{ token: string; staff: Staff }> {
  let response: Response;
  try {
    response = await fetch(`${ADMIN_API_URL}/admin/login`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new AdminApiError(0);
  }
  if (response.status === 401) throw new AdminApiError(401);
  if (!response.ok) throw await errorFrom(response);
  return response.json();
}

export async function revokeToken(token: string) {
  try {
    await fetch(`${ADMIN_API_URL}/admin/logout`, { method: "POST", headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(5000) });
  } catch {}
}
