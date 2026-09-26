"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { saveStaffAction, setStaffActiveAction } from "@/app/[lang]/admin/cms-actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { staffRoles, type StaffMember, type StaffRole } from "@/lib/admin-shared";
import { Field, FormStatus } from "./fields";

/** Create (member null) or edit a staff account. Passwords are only sent when filled in. */
export function StaffForm({ lang, t, member }: { lang: Locale; t: Dictionary["cms"]; member: StaffMember | null }) {
  const [value, setValue] = useState({ name: member?.name ?? "", email: member?.email ?? "", role: member?.role ?? ("sales" as StaffRole), password: "" });
  const [state, action, pending] = useActionState(saveStaffAction.bind(null, lang, member?.id ?? null), null);
  const f = state?.fields;
  const s = t.staff;
  const payload = member ? { name: value.name, role: value.role, ...(value.password ? { password: value.password } : {}) } : value;
  return <form action={action} className="admin-card cms-section cms-staff-form" aria-busy={pending}>
    <input type="hidden" name="payload" value={JSON.stringify(payload)} />
    <div className="cms-row">
      <Field label={s.name} error={f?.["name"]}><input value={value.name} onChange={e => setValue({ ...value, name: e.target.value })} required maxLength={120} autoComplete="off" /></Field>
      <Field label={s.email} error={f?.["email"]}><input type="email" dir="ltr" value={value.email} onChange={e => setValue({ ...value, email: e.target.value })} required disabled={Boolean(member)} maxLength={254} autoComplete="off" /></Field>
      <Field label={s.role} error={f?.["role"]}><select value={value.role} onChange={e => setValue({ ...value, role: e.target.value as StaffRole })}>{staffRoles.map(role => <option key={role} value={role}>{s.roles[role]}</option>)}</select></Field>
      <Field label={member ? s.newPassword : s.password} help={s.passwordHelp} error={f?.["password"]}><input type="password" dir="ltr" value={value.password} onChange={e => setValue({ ...value, password: e.target.value })} required={!member} minLength={12} autoComplete="new-password" /></Field>
    </div>
    <div className="cms-actions">
      <FormStatus state={state} />
      <button type="submit" className="button button-blue" disabled={pending}>{pending ? <><Loader2 size={16} className="spin" aria-hidden="true" /> {t.saving}</> : member ? t.save : t.create}</button>
    </div>
  </form>;
}

export function StaffActiveToggle({ lang, t, member }: { lang: Locale; t: Dictionary["cms"]; member: StaffMember }) {
  const [state, action, pending] = useActionState(setStaffActiveAction.bind(null, lang, member.id, !member.active), null);
  return <form action={action}>
    <button type="submit" className="button button-outline admin-small-button" disabled={pending}>{member.active ? t.staff.deactivate : t.staff.activate}</button>
    {state?.message && <span className="field-error" role="alert">{state.message}</span>}
  </form>;
}
