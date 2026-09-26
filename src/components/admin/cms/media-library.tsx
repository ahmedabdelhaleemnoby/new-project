"use client";

import { useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { deleteMediaAction } from "@/app/[lang]/admin/cms-actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { MediaItem } from "@/lib/admin-shared";
import { MediaGrid } from "./media-field";

export function MediaLibrary({ lang, t }: { lang: Locale; t: Dictionary["cms"] }) {
  const [type, setType] = useState<"" | "image" | "pdf">("");
  const [copied, setCopied] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const m = t.media;

  const actions = (item: MediaItem, remove: () => void) => <div className="cms-media-actions">
    <button type="button" className="cms-icon-button" aria-label={m.copy} title={m.copy} onClick={async () => { await navigator.clipboard.writeText(item.url).catch(() => {}); setCopied(item.id); window.setTimeout(() => setCopied(null), 1500); }}>{copied === item.id ? <Check size={15} /> : <Copy size={15} />}</button>
    <button type="button" className="cms-icon-button cms-danger" aria-label={t.delete} title={t.delete} onClick={async () => {
      if (!window.confirm(t.deleteConfirm)) return;
      const result = await deleteMediaAction(lang, item.id);
      if (result?.ok) { remove(); setError(null); } else setError(result?.message ?? null);
    }}><Trash2 size={15} /></button>
  </div>;

  return <>
    <div className="filter-buttons cms-media-filter" role="group">{([["", m.all], ["image", m.images], ["pdf", m.pdfs]] as const).map(([value, label]) => <button key={value} type="button" className={type === value ? "selected" : ""} aria-pressed={type === value} onClick={() => setType(value)}>{label}</button>)}</div>
    {error && <div className="form-error" role="alert"><p>{error}</p></div>}
    <MediaGrid key={type} lang={lang} t={m} type={type} actions={actions} />
  </>;
}
