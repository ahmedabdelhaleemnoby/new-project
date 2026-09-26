import { lang } from "next/root-params";
import { hasLocale } from "@/i18n/config";
import { NotFoundContent } from "@/components/not-found-content";
import { SiteShell } from "@/components/site-shell";

// Renders for unmatched URLs (via [...rest]), which sit outside the (site) group, so it adds the site chrome.
export default async function NotFound() {
  const value = await lang();
  const locale = value && hasLocale(value) ? value : "en";
  return <SiteShell lang={locale}><NotFoundContent lang={locale} /></SiteShell>;
}
