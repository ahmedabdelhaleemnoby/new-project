"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hasLocale, localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { AdminApiError, TOKEN_COOKIE, adminErrorMessage, adminFetch, getToken, login, revokeToken, workflowStatuses, type WorkflowStatus } from "@/lib/admin-api";

export type ActionState = { ok?: boolean; message?: string; fields?: Record<string, string>; email?: string } | null;

// Server actions can't read route params, so each action is bound to the page's locale.
const safeLocale = (lang: string): Locale => (hasLocale(lang) ? lang : "en");

function failure(error: unknown, lang: Locale): ActionState {
  if (!(error instanceof AdminApiError)) throw error; // redirects and unexpected errors
  const t = getDictionary(lang).admin;
  const fields = lang === "en" ? error.fields : Object.fromEntries(Object.keys(error.fields).map(key => [key, t.requestFailed]));
  return { ok: false, message: adminErrorMessage(error, lang, t), fields };
}

export async function loginAction(rawLang: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const lang = safeLocale(rawLang);
  const t = getDictionary(lang).admin;
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, message: t.enterCredentials, email };
  try {
    const { token } = await login(email, password);
    // Path "/" covers both /admin and /ar/admin.
    (await cookies()).set(TOKEN_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
  } catch (error) {
    return { ...failure(error, lang), email };
  }
  const next = String(formData.get("next") ?? "");
  const home = localePath(lang, "/admin");
  redirect(next.startsWith(home) && !next.startsWith("//") ? next : home);
}

export async function logoutAction(rawLang: string) {
  const token = await getToken();
  if (token) await revokeToken(token);
  (await cookies()).delete({ name: TOKEN_COOKIE, path: "/" });
  redirect(localePath(safeLocale(rawLang), "/admin/login"));
}

export async function updateEnquiryAction(rawLang: string, id: number, _: ActionState, formData: FormData): Promise<ActionState> {
  const lang = safeLocale(rawLang);
  const t = getDictionary(lang).admin;
  const status = String(formData.get("workflow_status") ?? "");
  const assigned = String(formData.get("assigned_to") ?? "").trim();
  if (!workflowStatuses.includes(status as WorkflowStatus)) return { ok: false, message: t.statusInvalid };
  if (assigned && !/^\d+$/.test(assigned)) return { ok: false, message: getDictionary(lang).form.checkFields, fields: { assigned_to: t.assignedInvalid } };
  try {
    await adminFetch(lang, `/admin/enquiries/${id}`, { method: "PATCH", body: { workflow_status: status, assigned_to: assigned ? Number(assigned) : null } });
  } catch (error) {
    return failure(error, lang);
  }
  revalidatePath(`/${lang}/admin`, "layout");
  return { ok: true, message: t.saved };
}

export async function retryNotificationAction(rawLang: string, enquiryId: number, notificationId: number, _: ActionState): Promise<ActionState> {
  const lang = safeLocale(rawLang);
  try {
    await adminFetch(lang, `/admin/enquiries/${enquiryId}/notifications/${notificationId}/retry`, { method: "POST" });
    revalidatePath(`/${lang}/admin/enquiries/${enquiryId}`);
    return { ok: true, message: getDictionary(lang).admin.retryQueued };
  } catch (error) {
    return failure(error, lang);
  }
}
