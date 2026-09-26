import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, FileDown, ArrowLeft } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { ContactBanner } from "@/components/site-footer";
import { fill, hasLocale, localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { getProducts } from "@/lib/content";

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  if (!hasLocale(params.lang)) return [];
  return (await getProducts(params.lang)).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[slug]">): Promise<Metadata> {
  const { lang, t } = await getLocale(params);
  const { slug } = await params;
  const product = (await getProducts(lang)).find(p => p.slug === slug);
  return { title: product?.name ?? t.product.notFound, description: product?.short };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/products/[slug]">) {
  const { lang, t } = await getLocale(params);
  const { slug } = await params;
  const product = (await getProducts(lang)).find(p => p.slug === slug);
  if (!product) notFound();
  const p = t.product;
  return <>
    <PageIntro lang={lang} eyebrow={fill(p.eyebrow, { category: t.categories[product.category] })} title={product.name} description={product.short} />
    <section className="section-pad"><div className="container"><div className="product-detail">
      <div className="product-detail-image" data-wipe=""><Image src={product.image} alt={p.imageAlt} fill sizes="(max-width:600px) 100vw, 50vw" /></div>
      <div data-reveal="end">
        <h2>{p.heading[0]}<br />{p.heading[1]}</h2>
        <p>{product.description}</p>
        {product.grades.length > 0 && <><h3>{p.grades}</h3><div className="grade-list">{product.grades.map(g => <span key={g}>{g}</span>)}</div></>}
        <div className="product-actions"><Link href={localePath(lang, `/contact?product=${product.slug}`)} className="button button-blue">{p.enquire} <ArrowUpRight size={18} /></Link>{product.datasheet && <a href={product.datasheet.url} target="_blank" rel="noopener noreferrer" className="button button-outline" aria-label={fill(t.nav.pdfNewTab, { label: product.datasheet.label })}>{p.datasheet} <FileDown size={18} /></a>}</div>
        <p className="technical-note">{p.note}</p>
        <Link href={localePath(lang, "/products")} className="text-link"><ArrowLeft size={16} /> {p.back}</Link>
      </div>
    </div></div></section>
    <ContactBanner lang={lang} />
  </>;
}
