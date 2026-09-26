import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { AdminApiError, adminErrorMessage, adminFetch, isNotReady } from "@/lib/admin-api";
import { getDictionary } from "@/i18n/dictionaries";

export type Loaded<T> = { data: T } | { notReady: true } | { error: string };

/** Loads dashboard data: a missing backend endpoint becomes `notReady`, a 404 record becomes a 404 page. */
export async function adminLoad<T>(lang: Locale, path: string, { notFoundOn404 = false } = {}): Promise<Loaded<T>> {
  try {
    const result = await adminFetch<{ data: T }>(lang, path);
    return { data: result.data };
  } catch (error) {
    if (!(error instanceof AdminApiError)) throw error;
    if (notFoundOn404 && error.status === 404) notFound();
    if (isNotReady(error)) return { notReady: true };
    return { error: adminErrorMessage(error, lang, getDictionary(lang).admin) };
  }
}
