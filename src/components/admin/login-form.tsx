"use client";

import { useActionState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { loginAction } from "@/app/[lang]/admin/actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function LoginForm({ lang, t, next }: { lang: Locale; t: Dictionary["admin"]; next: string }) {
  const [state, action, pending] = useActionState(loginAction.bind(null, lang), null);
  return <form action={action} className="admin-form" aria-busy={pending}>
    <input type="hidden" name="next" value={next} />
    <div className="field">
      <label htmlFor="admin-email">{t.email}</label>
      <input id="admin-email" name="email" type="email" dir="ltr" defaultValue={state?.email ?? ""} autoComplete="username" required maxLength={254} aria-invalid={state?.fields?.email ? true : undefined} />
      {state?.fields?.email && <span className="field-error">{state.fields.email}</span>}
    </div>
    <div className="field">
      <label htmlFor="admin-password">{t.password}</label>
      <input id="admin-password" name="password" type="password" dir="ltr" autoComplete="current-password" required aria-invalid={state?.fields?.password ? true : undefined} />
      {state?.fields?.password && <span className="field-error">{state.fields.password}</span>}
    </div>
    {state?.message && <div className="form-error" role="alert"><p>{state.message}</p></div>}
    <button type="submit" className="button button-blue" disabled={pending}>{pending ? <>{t.signingIn} <LoaderCircle size={18} className="spin" aria-hidden="true" /></> : <>{t.signIn} <ArrowUpRight size={18} aria-hidden="true" /></>}</button>
  </form>;
}
