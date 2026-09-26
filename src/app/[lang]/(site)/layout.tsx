import { SiteShell } from "@/components/site-shell";
import { getLocale } from "@/i18n/dictionaries";

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await getLocale(params);
  return <SiteShell lang={lang}>{children}</SiteShell>;
}
