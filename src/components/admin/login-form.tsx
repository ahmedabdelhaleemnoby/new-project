"use client";

import { useActionState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { loginAction } from "@/app/admin/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, null);
  return <form action={action} className="admin-form" aria-busy={pending}>
    <input type="hidden" name="next" value={next} />
    <div className="field">
      <label htmlFor="admin-email">Email</label>
      <input id="admin-email" name="email" type="email" defaultValue={state?.email ?? ""} autoComplete="username" required maxLength={254} aria-invalid={state?.fields?.email ? true : undefined} />
      {state?.fields?.email && <span className="field-error">{state.fields.email}</span>}
    </div>
    <div className="field">
      <label htmlFor="admin-password">Password</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required aria-invalid={state?.fields?.password ? true : undefined} />
      {state?.fields?.password && <span className="field-error">{state.fields.password}</span>}
    </div>
    {state?.message && <div className="form-error" role="alert"><p>{state.message}</p></div>}
    <button type="submit" className="button button-blue" disabled={pending}>{pending ? <>Signing in… <LoaderCircle size={18} className="spin" aria-hidden="true" /></> : <>Sign in <ArrowUpRight size={18} aria-hidden="true" /></>}</button>
  </form>;
}
