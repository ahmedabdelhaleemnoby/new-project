"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { updateEnquiryAction } from "@/app/[lang]/admin/actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { workflowStatuses, type WorkflowStatus } from "@/lib/admin-shared";

// Keys remount the fields when saved values change, because React resets uncontrolled fields after an action.
/** `staff` (from GET /admin/staff/options) turns assignment into a name picker; without it staff type an ID. */
export function EnquiryUpdateForm({ lang, t, assignLabel, staff, id, status, assignedTo }: { lang: Locale; t: Dictionary["admin"]; assignLabel: string; staff: { id: number; name: string }[] | null; id: number; status: WorkflowStatus; assignedTo: number | null }) {
  const [state, action, pending] = useActionState(updateEnquiryAction.bind(null, lang, id), null);
  return <form action={action} className="admin-form" aria-busy={pending}>
    <div className="field">
      <label htmlFor="u-status">{t.status}</label>
      <select key={status} id="u-status" name="workflow_status" defaultValue={status}>{workflowStatuses.map(s => <option key={s} value={s}>{t.statuses[s]}</option>)}</select>
    </div>
    {staff ? <div className="field">
      <label htmlFor="u-assigned">{assignLabel}</label>
      <select key={assignedTo ?? "none"} id="u-assigned" name="assigned_to" defaultValue={assignedTo ?? ""}><option value="">{t.unassigned}</option>{staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
    </div> : <div className="field">
      <label htmlFor="u-assigned">{t.assigned} <span>{t.optional}</span></label>
      <input key={assignedTo ?? "none"} id="u-assigned" name="assigned_to" inputMode="numeric" dir="ltr" defaultValue={assignedTo ?? ""} placeholder={t.unassigned} aria-invalid={state?.fields?.assigned_to ? true : undefined} aria-describedby={state?.fields?.assigned_to ? "u-assigned-error" : undefined} />
      {state?.fields?.assigned_to && <span className="field-error" id="u-assigned-error">{state.fields.assigned_to}</span>}
    </div>}
    {state?.message && <div className={state.ok ? "admin-notice" : "form-error"} role={state.ok ? "status" : "alert"}><p>{state.message}</p></div>}
    <button type="submit" className="button button-blue" disabled={pending}>{pending ? <>{t.saving} <LoaderCircle size={18} className="spin" aria-hidden="true" /></> : t.save}</button>
  </form>;
}
