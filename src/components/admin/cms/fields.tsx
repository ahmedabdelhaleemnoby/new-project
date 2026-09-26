"use client";

import type { ReactNode } from "react";
import type { Bilingual } from "@/lib/admin-shared";

/** Field error from a 422 response, looked up by dot path (e.g. "name.ar"). */
export function FieldError({ fields, name }: { fields?: Record<string, string>; name: string }) {
  const message = fields?.[name];
  return message ? <span className="field-error">{message}</span> : null;
}

/** Labelled control: the label wraps the control so it is announced by name; errors sit outside the label. */
export function Field({ label, help, error, children, wide = false }: { label: string; help?: string; error?: string; children: ReactNode; wide?: boolean }) {
  return <div className={`field${wide ? " field-wide" : ""}`}><label className="cms-field-label"><span>{label}</span>{children}</label>{error && <span className="field-error">{error}</span>}{help && <span className="cms-help">{help}</span>}</div>;
}

/** Side-by-side English and Arabic inputs; the Arabic one is right-to-left. */
export function BilingualInput({ label, value, onChange, fields, name, labels, multiline = false, maxLength, required = true }: {
  label: string; value: Bilingual; onChange: (value: Bilingual) => void; fields?: Record<string, string>; name: string;
  labels: { english: string; arabic: string }; multiline?: boolean; maxLength?: number; required?: boolean;
}) {
  const input = (locale: "en" | "ar") => {
    const props = { id: `${name}-${locale}`, value: value[locale], dir: locale === "ar" ? "rtl" : "ltr", lang: locale, maxLength, required, "aria-label": `${label} (${locale === "en" ? labels.english : labels.arabic})`, "aria-invalid": fields?.[`${name}.${locale}`] ? true : undefined, onChange: (e: { target: { value: string } }) => onChange({ ...value, [locale]: e.target.value }) } as const;
    return <div className="cms-lang-field">
      <label htmlFor={props.id} className="cms-lang-label">{locale === "en" ? labels.english : labels.arabic}</label>
      {multiline ? <textarea rows={4} {...props} /> : <input {...props} />}
      <FieldError fields={fields} name={`${name}.${locale}`} />
    </div>;
  };
  return <fieldset className="cms-bilingual"><legend>{label}</legend><div className="cms-bilingual-grid">{input("en")}{input("ar")}</div></fieldset>;
}

export function FormStatus({ state }: { state: { ok?: boolean; message?: string } | null }) {
  if (!state?.message) return null;
  return <div className={state.ok ? "admin-notice" : "form-error"} role={state.ok ? "status" : "alert"}><p>{state.message}</p></div>;
}
