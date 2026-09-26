"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { FileText, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { listMediaAction, uploadMediaAction } from "@/app/[lang]/admin/cms-actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { MediaItem } from "@/lib/admin-shared";

type MediaT = Dictionary["cms"]["media"];

/** Upload button shared by the picker and the library page. Uploads one file at a time through the Next server. */
export function UploadButton({ lang, t, accept, onUploaded, onError }: { lang: Locale; t: MediaT; accept: string; onUploaded: (item: MediaItem) => void; onError: (message: string) => void }) {
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.set("file", file);
      const result = await uploadMediaAction(lang, body);
      if (result.ok) onUploaded(result.item);
      else onError(result.message);
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  }
  return <label className={`button button-blue cms-upload${busy ? " is-busy" : ""}`}>
    {busy ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}{busy ? t.uploading : t.upload}
    <input ref={input} type="file" accept={accept} multiple disabled={busy} className="visually-hidden" onChange={e => upload(e.target.files)} />
  </label>;
}

/** Media library grid used by the picker dialog and the library page. */
export function MediaGrid({ lang, t, type, onSelect, actions }: { lang: Locale; t: MediaT; type: "" | "image" | "pdf"; onSelect?: (item: MediaItem) => void; actions?: (item: MediaItem, remove: () => void) => React.ReactNode }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (next: number, replace: boolean) => {
    setLoading(true);
    const result = await listMediaAction(lang, type, next);
    setLoading(false);
    if (!result.ok) { setError(result.message); return; }
    setError(null);
    setItems(current => (replace ? result.items : [...current, ...result.items]));
    setPage(result.meta.current_page);
    setLastPage(result.meta.last_page);
  }, [lang, type]);

  useEffect(() => { load(1, true); }, [load]);

  return <div className="cms-media">
    <div className="cms-media-toolbar">
      <UploadButton lang={lang} t={t} accept={type === "pdf" ? "application/pdf" : type === "image" ? "image/jpeg,image/png,image/webp" : "image/jpeg,image/png,image/webp,application/pdf"} onUploaded={item => setItems(current => [item, ...current])} onError={setError} />
      <span className="cms-help">{t.uploadHelp}</span>
    </div>
    {error && <div className="form-error" role="alert"><p>{error}</p></div>}
    <ul className="cms-media-grid">
      {items.map(item => <li key={item.id}>
        {onSelect ? <button type="button" className="cms-media-thumb" onClick={() => onSelect(item)} aria-label={`${t.select}: ${item.filename}`}><Thumb item={item} /></button> : <div className="cms-media-thumb"><Thumb item={item} /></div>}
        <span className="cms-media-name" title={item.filename}>{item.filename}</span>
        {actions?.(item, () => setItems(current => current.filter(x => x.id !== item.id)))}
      </li>)}
    </ul>
    {loading && <p className="admin-muted"><Loader2 size={14} className="spin" aria-hidden="true" /></p>}
    {!loading && page < lastPage && <button type="button" className="button button-outline" onClick={() => load(page + 1, false)}>{t.more}</button>}
  </div>;
}

function Thumb({ item }: { item: MediaItem }) {
  // Plain <img>: library files may come from any host the backend uses.
  return item.mime.startsWith("image/") ? <img src={item.url} alt="" loading="lazy" /> : <span className="cms-media-pdf"><FileText size={28} aria-hidden="true" />PDF</span>;
}

/** URL field with a preview and a "choose from library" dialog. */
export function MediaField({ lang, t, label, value, onChange, kind, error, required = false }: { lang: Locale; t: MediaT; label: string; value: string; onChange: (url: string) => void; kind: "image" | "pdf"; error?: string; required?: boolean }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  const id = useId();
  return <div className="field cms-media-field">
    <label htmlFor={id}>{label}</label>
    <div className="cms-media-row">
      {kind === "image" ? <span className="cms-media-preview">{value ? <img src={value} alt="" /> : <ImageIcon size={22} aria-hidden="true" />}</span> : <span className="cms-media-preview"><FileText size={22} aria-hidden="true" /></span>}
      <input id={id} type="text" dir="ltr" value={value} onChange={e => onChange(e.target.value)} placeholder={t.orPaste} required={required} aria-invalid={error ? true : undefined} />
      <button type="button" className="button button-outline" onClick={() => setOpen(true)}>{t.choose}</button>
      {value && !required && <button type="button" className="cms-icon-button" onClick={() => onChange("")} aria-label={t.close}><X size={16} /></button>}
    </div>
    {error && <span className="field-error">{error}</span>}
    <dialog ref={dialog} className="cms-dialog" onClose={() => setOpen(false)}>
      <div className="cms-dialog-head"><h2>{t.title}</h2><button type="button" className="cms-icon-button" onClick={() => setOpen(false)} aria-label={t.close}><X size={18} /></button></div>
      {open && <MediaGrid lang={lang} t={t} type={kind} onSelect={item => { onChange(item.url); setOpen(false); }} />}
    </dialog>
  </div>;
}
