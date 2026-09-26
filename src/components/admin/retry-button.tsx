"use client";

import { useActionState } from "react";
import { RotateCw } from "lucide-react";
import { retryNotificationAction } from "@/app/[lang]/admin/actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function RetryButton({ lang, t, enquiryId, notificationId }: { lang: Locale; t: Dictionary["admin"]; enquiryId: number; notificationId: number }) {
  const [state, action, pending] = useActionState(retryNotificationAction.bind(null, lang, enquiryId, notificationId), null);
  if (state?.ok) return <span className="admin-muted" role="status">{state.message}</span>;
  return <form action={action}>
    <button type="submit" className="button button-outline admin-small-button" disabled={pending}><RotateCw size={14} className={pending ? "spin" : undefined} aria-hidden="true" /> {t.retry}</button>
    {state?.message && <span className="field-error" role="alert">{state.message}</span>}
  </form>;
}
