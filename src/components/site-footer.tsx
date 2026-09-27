import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { fill, localePath, type Locale } from "@/i18n/config";
import { getSiteDictionary } from "@/i18n/dictionaries";
import { getSettings } from "@/lib/content";

export async function ContactBanner({ lang }: { lang: Locale }) {
  const t = (await getSiteDictionary(lang)).banner;
  return <section className="contact-banner"><div className="container contact-banner-inner" data-reveal=""><div><span className="eyebrow">{t.eyebrow}</span><h2>{t.title[0]}<br />{t.title[1]}</h2></div><Link href={localePath(lang, "/contact")} className="button button-light">{t.button} <ArrowUpRight size={19} /></Link></div></section>;
}

export async function SiteFooter({ lang }: { lang: Locale }) {
  const [dict, site] = await Promise.all([getSiteDictionary(lang), getSettings(lang)]);
  const t = dict.footer;
  const href = (path: string) => localePath(lang, path);
  return <footer className="site-footer"><div className="container"><div className="footer-main" data-stagger="">
    <div className="footer-brand"><Link href={href("/")} className="footer-wordmark"><Logo alt={site.fullName} /></Link><p>{t.tagline[0]}<br />{t.tagline[1]}</p></div>
    <div><h3>{t.explore}</h3><Link href={href("/about")}>{t.about}</Link><Link href={href("/products")}>{t.products}</Link><Link href={href("/industries")}>{t.sectors}</Link><Link href={href("/research")}>{t.research}</Link><Link href={href("/careers")}>{t.careers}</Link><a href={site.catalogueUrl} target="_blank" rel="noopener">{t.catalogue} <ArrowUpRight size={14} /></a></div>
    <div><h3>{t.contact}</h3><a href={`mailto:${site.email}`}>{site.email} <ArrowUpRight size={14} /></a>{site.phones.map(phone => <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, "")}`} dir="ltr">{phone}</a>)}{site.address && <p>{site.address.lines.map((line, i) => <span key={i}>{line}<br /></span>)}</p>}</div>
    <div className="footer-note"><span className="eyebrow">{t.noteEyebrow}</span><p>{t.note[0]}<br />{t.note[1]}</p><Link href={href("/contact")}>{t.noteLink} <ArrowUpRight size={18} /></Link></div>
  </div><div className="footer-bottom"><span>{fill(t.rights, { year: new Date().getFullYear(), name: site.fullName })}<small className="footer-legal" dir="auto">{fill(t.registration, { cr: site.legal.commercialRegister, tax: site.legal.taxCard })}</small></span><span>{t.motto}</span><a href="#top">{t.top}</a></div></div></footer>;
}
