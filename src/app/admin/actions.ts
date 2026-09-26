"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminApiError, TOKEN_COOKIE, adminFetch, getToken, login, revokeToken, workflowStatuses, type WorkflowStatus } from "@/lib/admin-api";

export type ActionState = { ok?: boolean; message?: string; fields?: Record<string, string>; email?: string } | null;

const failure = (error: unknown): ActionState => {
  if (error instanceof AdminApiError) return { ok: false, message: error.message, fields: error.fields };
  throw error; // redirects and unexpected errors
};

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, message: "Enter your email and password.", email };
  try {
    const { token } = await login(email, password);
    (await cookies()).set(TOKEN_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/admin", maxAge: 60 * 60 * 8 });
  } catch (error) {
    return { ...failure(error), email };
  }
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  const token = await getToken();
  if (token) await revokeToken(token);
  (await cookies()).delete({ name: TOKEN_COOKIE, path: "/admin" });
  redirect("/admin/login");
}

export async function updateEnquiryAction(id: number, _: ActionState, formData: FormData): Promise<ActionState> {
  const status = String(formData.get("workflow_status") ?? "");
  const assigned = String(formData.get("assigned_to") ?? "").trim();
  if (!workflowStatuses.includes(status as WorkflowStatus)) return { ok: false, message: "Choose a valid status." };
  if (assigned && !/^\d+$/.test(assigned)) return { ok: false, message: "Check the highlighted fields.", fields: { assigned_to: "Enter a staff ID number, or leave it empty." } };
  try {
    await adminFetch(`/admin/enquiries/${id}`, { method: "PATCH", body: { workflow_status: status, assigned_to: assigned ? Number(assigned) : null } });
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Changes saved." };
}

export async function retryNotificationAction(enquiryId: number, notificationId: number, _: ActionState): Promise<ActionState> {
  try {
    const result = await adminFetch<{ message: string }>(`/admin/enquiries/${enquiryId}/notifications/${notificationId}/retry`, { method: "POST" });
    revalidatePath(`/admin/enquiries/${enquiryId}`);
    return { ok: true, message: result.message };
  } catch (error) {
    return failure(error);
  }
}
