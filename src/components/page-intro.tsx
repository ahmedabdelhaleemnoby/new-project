import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import { getSiteDictionary } from "@/i18n/dictionaries";

export async function PageIntro({ lang, eyebrow, title, description }: { lang: Locale; eyebrow: string; title: string; description: string }) {
  const t = await getSiteDictionary(lang);
  return <section className="page-intro"><div className="container"><div className="breadcrumb"><Link href={localePath(lang, "/")}>{t.nav.home}</Link><span>/</span><span>{eyebrow}</span></div><div className="page-intro-grid"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div><p className="page-intro-description">{description}</p></div></div></section>;
}
