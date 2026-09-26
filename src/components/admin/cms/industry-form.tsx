"use client";

import { useActionState, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteIndustryAction, saveIndustryAction } from "@/app/[lang]/admin/cms-actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { industryIcons, type AdminIndustry } from "@/lib/admin-shared";
import { IndustryIcon } from "@/components/industry-icon";
import { BilingualInput, Field, FormStatus } from "./fields";
import { MediaField } from "./media-field";

export const emptyIndustry: Omit<AdminIndustry, "id"> = { slug: "", icon: "steel", sort_order: 0, published: true, name: { en: "", ar: "" }, text: { en: "", ar: "" }, brochure_url: null };

export function IndustryForm({ lang, t, industry, id }: { lang: Locale; t: Dictionary["cms"]; industry: Omit<AdminIndustry, "id">; id: number | null }) {
  const [value, setValue] = useState(industry);
  const [state, action, pending] = useActionState(saveIndustryAction.bind(null, lang, id), null);
  const [deleteState, deleteAction, deleting] = useActionState(id ? deleteIndustryAction.bind(null, lang, id) : async () => null, null);
  const set = <K extends keyof typeof value>(key: K, next: (typeof value)[K]) => setValue(current => ({ ...current, [key]: next }));
  const labels = { english: t.english, arabic: t.arabic };
  const f = state?.fields;
  const s = t.sectors;

  return <div className="cms-form-wrap">
    <form action={action} className="cms-form" aria-busy={pending}>
      <input type="hidden" name="payload" value={JSON.stringify({ ...value, slug: value.slug.trim() })} />
      <section className="admin-card cms-section">
        <div className="cms-row">
          <Field label={t.slug} help={t.slugHelp} error={f?.["slug"]}><input dir="ltr" value={value.slug} onChange={e => set("slug", e.target.value.toLowerCase())} pattern="[a-z0-9]+(-[a-z0-9]+)*" required maxLength={80} aria-invalid={f?.slug ? true : undefined} /></Field>
          <Field label={t.sortOrder}><input type="number" min={0} value={value.sort_order} onChange={e => set("sort_order", Number(e.target.value) || 0)} /></Field>
          <label className="cms-check"><input type="checkbox" checked={value.published} onChange={e => set("published", e.target.checked)} /> {t.published}</label>
        </div>
        <fieldset className="cms-icons"><legend>{s.icon}</legend>{industryIcons.map(icon => <label key={icon} className={value.icon === icon ? "selected" : ""}><input type="radio" name="icon" className="visually-hidden" checked={value.icon === icon} onChange={() => set("icon", icon)} /><IndustryIcon type={icon} /><span>{s.icons[icon]}</span></label>)}</fieldset>
        <BilingualInput label={s.name} name="name" value={value.name} onChange={v => set("name", v)} fields={f} labels={labels} maxLength={80} />
        <BilingualInput label={s.text} name="text" value={value.text} onChange={v => set("text", v)} fields={f} labels={labels} multiline maxLength={400} />
        <MediaField lang={lang} t={t.media} label={s.brochure} kind="pdf" value={value.brochure_url ?? ""} onChange={url => set("brochure_url", url || null)} error={f?.brochure_url} />
      </section>
      <div className="cms-actions">
        <FormStatus state={state} />
        <button type="submit" className="button button-blue" disabled={pending}>{pending ? <><Loader2 size={16} className="spin" aria-hidden="true" /> {t.saving}</> : id ? t.save : t.create}</button>
      </div>
    </form>
    {id && <form action={deleteAction} className="cms-delete" onSubmit={e => { if (!window.confirm(t.deleteConfirm)) e.preventDefault(); }}>
      <FormStatus state={deleteState} />
      <button type="submit" className="button button-outline cms-danger" disabled={deleting}><Trash2 size={16} /> {t.delete}</button>
    </form>}
  </div>;
}
