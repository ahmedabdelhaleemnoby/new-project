"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { updateEnquiryAction } from "@/app/admin/actions";
import { statusLabels, workflowStatuses, type WorkflowStatus } from "@/lib/admin-shared";

// Keys remount the fields when saved values change, because React resets uncontrolled fields after an action.
export function EnquiryUpdateForm({ id, status, assignedTo }: { id: number; status: WorkflowStatus; assignedTo: number | null }) {
  const [state, action, pending] = useActionState(updateEnquiryAction.bind(null, id), null);
  return <form action={action} className="admin-form" aria-busy={pending}>
    <div className="field">
      <label htmlFor="u-status">Status</label>
      <select key={status} id="u-status" name="workflow_status" defaultValue={status}>{workflowStatuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}</select>
    </div>
    <div className="field">
      <label htmlFor="u-assigned">Assigned staff ID <span>(optional)</span></label>
      <input key={assignedTo ?? "none"} id="u-assigned" name="assigned_to" inputMode="numeric" defaultValue={assignedTo ?? ""} placeholder="Unassigned" aria-invalid={state?.fields?.assigned_to ? true : undefined} aria-describedby={state?.fields?.assigned_to ? "u-assigned-error" : undefined} />
      {state?.fields?.assigned_to && <span className="field-error" id="u-assigned-error">{state.fields.assigned_to}</span>}
    </div>
    {state?.message && <div className={state.ok ? "admin-notice" : "form-error"} role={state.ok ? "status" : "alert"}><p>{state.message}</p></div>}
    <button type="submit" className="button button-blue" disabled={pending}>{pending ? <>Saving… <LoaderCircle size={18} className="spin" aria-hidden="true" /></> : "Save changes"}</button>
  </form>;
}
