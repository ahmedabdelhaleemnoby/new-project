"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { Loader2, RotateCcw, Search } from "lucide-react";
import { saveContentAction } from "@/app/[lang]/admin/cms-actions";
import { fill, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { FormStatus } from "./fields";

type Texts = Record<"en" | "ar", Record<string, string>>;
type Edits = Record<"en" | "ar", Record<string, string | null>>;

/** Page-text editor: every editable dictionary string, English and Arabic side by side, grouped by section. */
export function ContentEditor({ lang, t, defaults, overrides }: { lang: Locale; t: Dictionary["cms"]; defaults: Texts; overrides: Texts }) {
  const router = useRouter();
  const [edits, setEdits] = useState<Edits>({ en: {}, ar: {} });
  const [query, setQuery] = useState("");
  const [changedOnly, setChangedOnly] = useState(false);
  const [state, action, pending] = useActionState(saveContentAction.bind(null, lang), null);
  const c = t.content;

  // After a successful save, reload the server data (the new overrides) and clear local edits.
  useEffect(() => {
    if (!state?.ok) return;
    setEdits({ en: {}, ar: {} });
    router.refresh();
  }, [state, router]);

  const current = (locale: "en" | "ar", key: string) => {
    const edit = edits[locale][key];
    if (edit !== undefined) return edit ?? defaults[locale][key];
    return overrides[locale][key] ?? defaults[locale][key];
  };
  const isChanged = (key: string) => (["en", "ar"] as const).some(l => current(l, key) !== defaults[l][key]);
  const unsaved = Object.keys(edits.en).length + Object.keys(edits.ar).length;

  const setText = (locale: "en" | "ar", key: string, text: string) => setEdits(prev => {
    const next = { ...prev[locale] };
    const saved = overrides[locale][key] ?? defaults[locale][key];
    if (text === saved) delete next[key];
    else next[key] = text === defaults[locale][key] ? null : text;
    return { ...prev, [locale]: next };
  });
  const reset = (key: string) => setEdits(prev => {
    const next: Edits = { en: { ...prev.en }, ar: { ...prev.ar } };
    for (const locale of ["en", "ar"] as const) {
      if (overrides[locale][key] !== undefined) next[locale][key] = null;
      else delete next[locale][key];
    }
    return next;
  });

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups = new Map<string, string[]>();
    for (const key of Object.keys(defaults.en)) {
      if (q && ![key, current("en", key), current("ar", key)].some(v => v.toLowerCase().includes(q))) continue;
      if (changedOnly && !isChanged(key)) continue;
      const section = key.split(".")[0];
      groups.set(section, [...(groups.get(section) ?? []), key]);
    }
    return [...groups];
  }, [query, changedOnly, edits, overrides, defaults]);

  return <form action={action} className="cms-content">
    <input type="hidden" name="payload" value={JSON.stringify(edits)} />
    <div className="cms-content-bar">
      <div className="admin-input-icon"><Search size={16} aria-hidden="true" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={c.search} aria-label={c.search} /></div>
      <label className="cms-check"><input type="checkbox" checked={changedOnly} onChange={e => setChangedOnly(e.target.checked)} /> {c.changedOnly}</label>
      <span className="cms-help">{unsaved ? fill(c.unsaved, { count: unsaved }) : ""}</span>
      <button type="submit" className="button button-blue" disabled={pending || !unsaved}>{pending ? <><Loader2 size={16} className="spin" aria-hidden="true" /> {t.saving}</> : t.save}</button>
    </div>
    <FormStatus state={state} />
    <p className="cms-help">{c.placeholders}</p>
    {sections.length === 0 && <p className="admin-muted">{t.empty}</p>}
    {sections.map(([section, keys]) => <details key={section} className="admin-card cms-text-section" open={Boolean(query) || changedOnly}>
      <summary>{c.sections[section as keyof typeof c.sections] ?? section} <span className="cms-count">{keys.length}</span></summary>
      {keys.map(key => {
        const changed = isChanged(key);
        const long = defaults.en[key].length > 70;
        return <div key={key} className={`cms-text-row${changed ? " is-changed" : ""}`}>
          <div className="cms-text-key"><code dir="ltr">{key.slice(section.length + 1)}</code>{changed && <><span className="cms-badge">{c.changed}</span><button type="button" className="cms-link-button" onClick={() => reset(key)}><RotateCcw size={12} /> {c.reset}</button></>}</div>
          {(["en", "ar"] as const).map(locale => {
            const props = { value: current(locale, key), dir: locale === "ar" ? "rtl" : "ltr", lang: locale, "aria-label": `${key} (${locale === "en" ? t.english : t.arabic})`, maxLength: 4000, onChange: (e: { target: { value: string } }) => setText(locale, key, e.target.value) } as const;
            return long ? <textarea key={locale} rows={3} {...props} /> : <input key={locale} {...props} />;
          })}
        </div>;
      })}
    </details>)}
  </form>;
}
