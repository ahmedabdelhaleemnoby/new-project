import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollProgress } from "@/components/motion";
import { Intro } from "@/components/intro/intro";
import { site } from "@/lib/site";
import { localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getIndustries, getProductMenu, getSectorMenu } from "@/lib/content";

export async function SiteShell({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  const t = getDictionary(lang);
  const [productMenu, sectorSheets, industries] = await Promise.all([getProductMenu(lang), getSectorMenu(lang), getIndustries(lang)]);
  // Without sector brochures from the API, the sectors menu links to each sector on the sectors page.
  const sectors = sectorSheets.length
    ? sectorSheets.map(s => ({ label: s.label, href: s.url, pdf: true }))
    : industries.map(i => ({ label: i.name, href: localePath(lang, `/industries#${i.slug}`), pdf: false }));
  return <><Intro skipLabel={t.intro.skip} logoAlt={site.fullName[lang]} /><ScrollProgress /><a className="skip-link" href="#main">{t.nav.skip}</a><SiteHeader lang={lang} t={t.nav} productMenu={productMenu} sectors={sectors} /><main id="main">{children}</main><SiteFooter lang={lang} /></>;
}
