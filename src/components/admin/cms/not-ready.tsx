import { Construction } from "lucide-react";
import { fill } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** Shown when the backend doesn't provide an endpoint yet (docs/BACKEND_CMS_SPEC.md). */
export function NotReady({ t, endpoint, section }: { t: Dictionary["cms"]; endpoint: string; section: string }) {
  return <div className="cms-not-ready" role="status"><Construction size={28} aria-hidden="true" /><div><h2>{t.notReadyTitle}</h2><p>{fill(t.notReadyText, { endpoint, section })}</p></div></div>;
}
