"use client";

import { useActionState } from "react";
import { RotateCw } from "lucide-react";
import { retryNotificationAction } from "@/app/admin/actions";

export function RetryButton({ enquiryId, notificationId }: { enquiryId: number; notificationId: number }) {
  const [state, action, pending] = useActionState(retryNotificationAction.bind(null, enquiryId, notificationId), null);
  if (state?.ok) return <span className="admin-muted" role="status">{state.message}</span>;
  return <form action={action}>
    <button type="submit" className="button button-outline admin-small-button" disabled={pending}><RotateCw size={14} className={pending ? "spin" : undefined} aria-hidden="true" /> Retry</button>
    {state?.message && <span className="field-error" role="alert">{state.message}</span>}
  </form>;
}
