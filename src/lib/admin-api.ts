// Server-only client for the staff endpoints of the Asfour M&R API (bearer token auth).
// The token lives in an httpOnly cookie and is never sent to the browser.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_API_URL = (process.env.ADMIN_API_URL ?? process.env.NEXT_PUBLIC_ENQUIRY_API_URL ?? "https://project2.gfoura.com/api/v1").replace(/\/$/, "");
export const TOKEN_COOKIE = "asfour_admin_token";

export * from "@/lib/admin-shared";
import type { Staff } from "@/lib/admin-shared";

export class AdminApiError extends Error {
  constructor(public status: number, message: string, public fields: Record<string, string> = {}) { super(message); }
}

async function errorFrom(response: Response) {
  let body: { message?: string; error?: { message?: string }; errors?: Record<string, string[]> } = {};
  try { body = await response.json(); } catch {}
  const fields = Object.fromEntries(Object.entries(body.errors ?? {}).map(([key, messages]) => [key, messages[0] ?? "Invalid value."]));
  const message = body.error?.message ?? body.message
    ?? (response.status === 403 ? "You don’t have permission to do this." : response.status >= 500 ? "The enquiry service is unavailable. Try again shortly." : "The request could not be completed.");
  return new AdminApiError(response.status, message, fields);
}

export async function getToken() {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

/** Authenticated request. A missing or rejected token sends the user to the login page. */
export async function adminFetch<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = await getToken();
  if (!token) redirect("/admin/login");
  let response: Response;
  try {
    response = await fetch(`${ADMIN_API_URL}${path}`, {
      method: init.method ?? "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}`, ...(init.body ? { "Content-Type": "application/json" } : {}) },
      body: init.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new AdminApiError(0, "Couldn’t reach the enquiry service. Check the connection and try again.");
  }
  if (response.status === 401) redirect("/admin/login?expired=1");
  if (!response.ok) throw await errorFrom(response);
  return response.json() as Promise<T>;
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
    throw new AdminApiError(0, "Couldn’t reach the enquiry service. Try again shortly.");
  }
  if (response.status === 401) throw new AdminApiError(401, "Incorrect email or password.");
  if (!response.ok) throw await errorFrom(response);
  return response.json();
}

export async function revokeToken(token: string) {
  try {
    await fetch(`${ADMIN_API_URL}/admin/logout`, { method: "POST", headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(5000) });
  } catch {}
}
