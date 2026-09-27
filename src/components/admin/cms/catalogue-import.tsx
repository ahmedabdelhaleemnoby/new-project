"use client";

import { useActionState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { importCatalogueAction } from "@/app/[lang]/admin/cms-actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { FormStatus } from "./fields";

/** One-click load of the built-in Ajyad catalogue into the CMS (confirmation required: it deletes other products). */
export function CatalogueImport({ lang, t }: { lang: Locale; t: Dictionary["cms"]["import"] }) {
  const [state, action, pending] = useActionState(importCatalogueAction.bind(null, lang), null);
  return <form action={action} className="admin-card cms-import" onSubmit={e => { if (!window.confirm(t.confirm)) e.preventDefault(); }} aria-busy={pending}>
    <div><h2>{t.title}</h2><p>{t.text}</p></div>
    <button type="submit" className="button button-blue" disabled={pending}>{pending ? <><Loader2 size={16} className="spin" aria-hidden="true" /> {t.running}</> : <><FileDown size={16} aria-hidden="true" /> {t.button}</>}</button>
    <FormStatus state={state} />
  </form>;
}
