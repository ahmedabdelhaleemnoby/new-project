import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { Hero } from "@/components/hero";
import { ProductPreview } from "@/components/product-explorer";
import { IndustryIcon } from "@/components/industry-icon";
import { ContactBanner } from "@/components/site-footer";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { getIndustries, getProducts } from "@/lib/content";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang, t } = await getLocale(params);
  const h = t.home;
  const href = (path: string) => localePath(lang, path);
  const [products, industries] = await Promise.all([getProducts(lang), getIndustries(lang)]);
  return <>
    <Hero lang={lang} t={t.hero} />
    <section className="intro-section section-pad" id="introduction"><div className="container"><div className="section-heading"><div data-reveal=""><p className="eyebrow"><span className="section-number">01 /</span> {h.introEyebrow}</p><h2>{h.introTitle[0]}<br /><span className="text-blue">{h.introTitle[1]}</span></h2></div><div className="intro-copy" data-reveal="" style={{ ["--delay" as string]: "150ms" }}><p>{h.introLead}</p><p>{h.introText}</p><Link href={href("/about")} className="text-link">{h.introLink} <ArrowUpRight size={20} /></Link></div></div></div></section>
    <section className="products-section section-pad"><div className="container"><div className="section-heading compact" data-reveal=""><div><p className="eyebrow"><span className="section-number">02 /</span> {h.productsEyebrow}</p><h2>{h.productsTitle[0]}<br />{h.productsTitle[1]}</h2></div><Link className="button button-outline" href={href("/products")}>{h.productsLink} <ArrowUpRight size={19} /></Link></div><div data-reveal="zoom"><ProductPreview lang={lang} t={t.productPreview} products={products} /></div></div></section>
    <section className="industries-section section-pad"><div className="container"><div className="section-heading compact" data-reveal=""><div><p className="eyebrow"><span className="section-number">03 /</span> {h.sectorsEyebrow}</p><h2>{h.sectorsTitle[0]}<br />{h.sectorsTitle[1]}</h2></div><p className="heading-aside">{h.sectorsAside[0]}<br />{h.sectorsAside[1]}</p></div><div className="industry-home-grid" data-stagger="">{industries.slice(0, 4).map((industry, i) => <Link key={industry.slug} className="industry-home-item" href={href(`/industries#${industry.slug}`)}><div className="industry-top"><IndustryIcon type={industry.icon} /><span>0{i + 1}</span></div><h3>{industry.name}</h3><div className="industry-bottom"><span>{h.sectorsItemLink}</span><ArrowUpRight size={24} /></div></Link>)}</div><Link href={href("/industries")} className="text-link light-link">{h.sectorsLink} <ArrowRight size={18} /></Link></div></section>
    <section className="research-section section-pad"><div className="container research-grid"><div className="research-visual" data-wipe=""><Image src="/images/research.jpg" alt={h.researchImageAlt} fill sizes="(max-width: 760px) 100vw, 50vw" /><div className="image-corner"><Plus size={26} /> {h.researchCorner[0]}<br />{h.researchCorner[1]}</div></div><div className="research-copy" data-reveal="end"><p className="eyebrow"><span className="section-number">04 /</span> {h.researchEyebrow}</p><h2>{h.researchTitle[0]}<br />{h.researchTitle[1]}<br /><span className="text-blue">{h.researchTitle[2]}</span></h2><p>{h.researchText}</p><Link href={href("/research")} className="text-link">{h.researchLink} <ArrowUpRight size={19} /></Link></div></div></section>
    <ContactBanner lang={lang} />
  </>;
}
