"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { saveSettingsAction } from "@/app/[lang]/admin/cms-actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { AdminSettings } from "@/lib/admin-shared";
import { imageKeys } from "@/lib/settings";
import { BilingualInput, Field, FieldError, FormStatus } from "./fields";
import { MediaField } from "./media-field";

export function SettingsForm({ lang, t, settings }: { lang: Locale; t: Dictionary["cms"]; settings: AdminSettings }) {
  const [value, setValue] = useState(settings);
  const [address, setAddress] = useState({ en: (settings.address?.en ?? []).join("\n"), ar: (settings.address?.ar ?? []).join("\n"), map_url: settings.address?.map_url ?? "", hidden: !settings.address });
  const [state, action, pending] = useActionState(saveSettingsAction.bind(null, lang), null);
  const set = <K extends keyof AdminSettings>(key: K, next: AdminSettings[K]) => setValue(current => ({ ...current, [key]: next }));
  const labels = { english: t.english, arabic: t.arabic };
  const f = state?.fields;
  const s = t.settings;
  const lines = (text: string) => text.split("\n").map(l => l.trim()).filter(Boolean);

  const payload: AdminSettings = {
    ...value,
    email: value.email.trim(),
    phone: value.phone?.trim() || null,
    address: address.hidden ? null : { en: lines(address.en), ar: lines(address.ar), map_url: address.map_url.trim() },
    images: Object.fromEntries(imageKeys.map(key => [key, value.images[key] || null])),
  };

  return <form action={action} className="cms-form" aria-busy={pending}>
    <input type="hidden" name="payload" value={JSON.stringify(payload)} />
    <section className="admin-card cms-section">
      <h2>{s.identity}</h2>
      <BilingualInput label={s.name} name="name" value={value.name} onChange={v => set("name", v)} fields={f} labels={labels} maxLength={60} />
      <BilingualInput label={s.fullName} name="full_name" value={value.full_name} onChange={v => set("full_name", v)} fields={f} labels={labels} maxLength={120} />
    </section>

    <section className="admin-card cms-section">
      <h2>{s.contact}</h2>
      <div className="cms-row">
        <Field label={s.email} error={f?.["email"]}><input type="email" dir="ltr" value={value.email} onChange={e => set("email", e.target.value)} required maxLength={254} /></Field>
        <Field label={s.phone} error={f?.["phone"]}><input type="tel" dir="ltr" value={value.phone ?? ""} onChange={e => set("phone", e.target.value)} maxLength={50} /></Field>
      </div>
      <div className="cms-row">
        <Field label={s.secondaryEmail} error={f?.["secondary_email.email"]}><input type="email" dir="ltr" value={value.secondary_email?.email ?? ""} maxLength={254} onChange={e => set("secondary_email", e.target.value ? { email: e.target.value, label: value.secondary_email?.label ?? { en: "", ar: "" } } : null)} /></Field>
      </div>
      {value.secondary_email && <BilingualInput label={s.secondaryLabel} name="secondary_email.label" value={value.secondary_email.label} onChange={label => set("secondary_email", { ...value.secondary_email!, label })} fields={f} labels={labels} maxLength={60} />}
    </section>

    <section className="admin-card cms-section">
      <h2>{s.address}</h2>
      <label className="cms-check"><input type="checkbox" checked={address.hidden} onChange={e => setAddress({ ...address, hidden: e.target.checked })} /> {s.noAddress}</label>
      {!address.hidden && <>
        <fieldset className="cms-bilingual"><legend>{s.addressLines}</legend><div className="cms-bilingual-grid">
          <div className="cms-lang-field"><label className="cms-lang-label" htmlFor="addr-en">{t.english}</label><textarea id="addr-en" rows={3} value={address.en} onChange={e => setAddress({ ...address, en: e.target.value })} /><FieldError fields={f} name="address.en" /></div>
          <div className="cms-lang-field"><label className="cms-lang-label" htmlFor="addr-ar">{t.arabic}</label><textarea id="addr-ar" rows={3} dir="rtl" lang="ar" value={address.ar} onChange={e => setAddress({ ...address, ar: e.target.value })} /><FieldError fields={f} name="address.ar" /></div>
        </div></fieldset>
        <Field label={s.mapUrl} error={f?.["address.map_url"]}><input type="url" dir="ltr" value={address.map_url} onChange={e => setAddress({ ...address, map_url: e.target.value })} /></Field>
      </>}
    </section>

    <section className="admin-card cms-section">
      <h2>{s.legal}</h2>
      <BilingualInput label={s.legalForm} name="legal.form" value={value.legal.form} onChange={form => set("legal", { ...value.legal, form })} fields={f} labels={labels} maxLength={60} />
      <div className="cms-row">
        <Field label={s.commercialRegister}><input dir="ltr" value={value.legal.commercial_register} maxLength={60} onChange={e => set("legal", { ...value.legal, commercial_register: e.target.value })} /></Field>
        <Field label={s.taxCard}><input dir="ltr" value={value.legal.tax_card} maxLength={60} onChange={e => set("legal", { ...value.legal, tax_card: e.target.value })} /></Field>
      </div>
    </section>

    <section className="admin-card cms-section">
      <h2>{s.photos}</h2>
      <p className="cms-help">{s.photosHelp}</p>
      <div className="cms-photo-grid">{imageKeys.map(key => <MediaField key={key} lang={lang} t={t.media} label={s.images[key]} kind="image" value={value.images[key] ?? ""} onChange={url => set("images", { ...value.images, [key]: url })} error={f?.[`images.${key}`]} />)}</div>
    </section>

    <div className="cms-actions">
      <FormStatus state={state} />
      <button type="submit" className="button button-blue" disabled={pending}>{pending ? <><Loader2 size={16} className="spin" aria-hidden="true" /> {t.saving}</> : t.save}</button>
    </div>
  </form>;
}
