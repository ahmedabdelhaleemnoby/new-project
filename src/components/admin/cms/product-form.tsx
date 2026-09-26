"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowUpRight, Loader2, Plus, Trash2 } from "lucide-react";
import { deleteProductAction, saveProductAction } from "@/app/[lang]/admin/cms-actions";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { AdminProduct, Bilingual, DatasheetGroup } from "@/lib/admin-shared";
import { BilingualInput, Field, FormStatus } from "./fields";
import { MediaField } from "./media-field";

const blank: Bilingual = { en: "", ar: "" };
export const emptyProduct: Omit<AdminProduct, "id"> = { slug: "", category: "Shaped", sort_order: 0, published: true, image: "", name: blank, short: blank, description: blank, grades: [], featured_datasheet: null, datasheet_groups: [] };

export function ProductForm({ lang, t, categories, product, id }: { lang: Locale; t: Dictionary["cms"]; categories: Dictionary["categories"]; product: Omit<AdminProduct, "id">; id: number | null }) {
  const [value, setValue] = useState(product);
  const [grades, setGrades] = useState(product.grades.join("\n"));
  const [state, action, pending] = useActionState(saveProductAction.bind(null, lang, id), null);
  const [deleteState, deleteAction, deleting] = useActionState(id ? deleteProductAction.bind(null, lang, id) : async () => null, null);
  const set = <K extends keyof typeof value>(key: K, next: (typeof value)[K]) => setValue(current => ({ ...current, [key]: next }));
  const labels = { english: t.english, arabic: t.arabic };
  const f = state?.fields;
  const p = t.products;

  const payload = JSON.stringify({ ...value, slug: value.slug.trim(), grades: grades.split("\n").map(g => g.trim()).filter(Boolean) });
  const setGroup = (index: number, group: DatasheetGroup) => set("datasheet_groups", value.datasheet_groups.map((g, i) => (i === index ? group : g)));

  return <div className="cms-form-wrap">
    <form action={action} className="cms-form" aria-busy={pending}>
      <input type="hidden" name="payload" value={payload} />
      <section className="admin-card cms-section">
        <div className="cms-row">
          <Field label={t.slug} help={t.slugHelp} error={f?.["slug"]}><input dir="ltr" value={value.slug} onChange={e => set("slug", e.target.value.toLowerCase())} pattern="[a-z0-9]+(-[a-z0-9]+)*" required maxLength={80} aria-invalid={f?.slug ? true : undefined} /></Field>
          <Field label={p.category}><select value={value.category} onChange={e => set("category", e.target.value as AdminProduct["category"])}><option value="Shaped">{categories.Shaped}</option><option value="Unshaped">{categories.Unshaped}</option></select></Field>
          <Field label={t.sortOrder}><input type="number" min={0} value={value.sort_order} onChange={e => set("sort_order", Number(e.target.value) || 0)} /></Field>
          <label className="cms-check"><input type="checkbox" checked={value.published} onChange={e => set("published", e.target.checked)} /> {t.published}</label>
        </div>
        <BilingualInput label={p.name} name="name" value={value.name} onChange={v => set("name", v)} fields={f} labels={labels} maxLength={120} />
        <BilingualInput label={p.short} name="short" value={value.short} onChange={v => set("short", v)} fields={f} labels={labels} maxLength={200} />
        <BilingualInput label={p.description} name="description" value={value.description} onChange={v => set("description", v)} fields={f} labels={labels} multiline maxLength={2000} />
        <MediaField lang={lang} t={t.media} label={p.image} kind="image" value={value.image} onChange={v => set("image", v)} error={f?.image} required />
        <Field label={p.grades} help={p.gradesHelp} error={f?.["grades"]}><textarea rows={4} dir="ltr" value={grades} onChange={e => setGrades(e.target.value)} /></Field>
      </section>

      <section className="admin-card cms-section">
        <h2>{p.featured}</h2>
        <MediaField lang={lang} t={t.media} label={p.sheetUrl} kind="pdf" value={value.featured_datasheet?.url ?? ""} onChange={url => set("featured_datasheet", url ? { label: value.featured_datasheet?.label ?? blank, url } : null)} error={f?.["featured_datasheet.url"]} />
        {value.featured_datasheet && <BilingualInput label={p.featuredLabel} name="featured_datasheet.label" value={value.featured_datasheet.label} onChange={label => set("featured_datasheet", { ...value.featured_datasheet!, label })} fields={f} labels={labels} maxLength={80} />}
      </section>

      <section className="admin-card cms-section">
        <h2>{p.groups}</h2>
        <p className="cms-help">{p.groupsHelp}</p>
        {value.datasheet_groups.map((group, gi) => <div key={gi} className="cms-group">
          <div className="cms-group-head">
            <label className="cms-check"><input type="checkbox" checked={group.name !== null} onChange={e => setGroup(gi, { ...group, name: e.target.checked ? blank : null })} /> {p.groupName}</label>
            <button type="button" className="cms-icon-button" onClick={() => set("datasheet_groups", value.datasheet_groups.filter((_, i) => i !== gi))} aria-label={p.remove}><Trash2 size={16} /></button>
          </div>
          {group.name && <BilingualInput label={p.groupName} name={`datasheet_groups.${gi}.name`} value={group.name} onChange={name => setGroup(gi, { ...group, name })} fields={f} labels={labels} maxLength={80} />}
          {group.sheets.map((sheet, si) => <div key={si} className="cms-sheet">
            <Field label={p.sheetLabel} error={f?.[`datasheet_groups.${gi}.sheets.${si}.label`]}><input dir="ltr" value={sheet.label} maxLength={80} required onChange={e => setGroup(gi, { ...group, sheets: group.sheets.map((s, i) => (i === si ? { ...s, label: e.target.value } : s)) })} /></Field>
            <MediaField lang={lang} t={t.media} label={p.sheetUrl} kind="pdf" value={sheet.url} required error={f?.[`datasheet_groups.${gi}.sheets.${si}.url`]} onChange={url => setGroup(gi, { ...group, sheets: group.sheets.map((s, i) => (i === si ? { ...s, url } : s)) })} />
            <button type="button" className="cms-icon-button" onClick={() => setGroup(gi, { ...group, sheets: group.sheets.filter((_, i) => i !== si) })} aria-label={p.remove}><Trash2 size={16} /></button>
          </div>)}
          <button type="button" className="button button-outline cms-small" onClick={() => setGroup(gi, { ...group, sheets: [...group.sheets, { label: "", url: "" }] })}><Plus size={14} /> {p.addSheet}</button>
        </div>)}
        <button type="button" className="button button-outline cms-small" onClick={() => set("datasheet_groups", [...value.datasheet_groups, { name: null, sheets: [{ label: "", url: "" }] }])}><Plus size={14} /> {p.addGroup}</button>
      </section>

      <div className="cms-actions">
        <FormStatus state={state} />
        <button type="submit" className="button button-blue" disabled={pending}>{pending ? <><Loader2 size={16} className="spin" aria-hidden="true" /> {t.saving}</> : id ? t.save : t.create}</button>
        {id && value.slug && <Link href={localePath(lang, `/products/${value.slug}`)} target="_blank" className="text-link">{p.view} <ArrowUpRight size={16} /></Link>}
      </div>
    </form>
    {id && <form action={deleteAction} className="cms-delete" onSubmit={e => { if (!window.confirm(t.deleteConfirm)) e.preventDefault(); }}>
      <FormStatus state={deleteState} />
      <button type="submit" className="button button-outline cms-danger" disabled={deleting}><Trash2 size={16} /> {t.delete}</button>
    </form>}
  </div>;
}
