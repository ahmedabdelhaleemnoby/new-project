import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { ProductCatalogue } from "@/components/product-explorer";
import { ContactBanner } from "@/components/site-footer";
import { getLocale } from "@/i18n/dictionaries";
import { FileDown } from "lucide-react";
import { getProducts, getSettings } from "@/lib/content";

export async function generateMetadata({ params }: PageProps<"/[lang]/products">): Promise<Metadata> {
  const { t } = await getLocale(params);
  return { title: t.productsPage.title };
}

export default async function ProductsPage({ params, searchParams }: PageProps<"/[lang]/products">) {
  const { lang, t } = await getLocale(params);
  const [{ category }, products, { catalogueUrl }] = await Promise.all([searchParams, getProducts(lang), getSettings(lang)]);
  const initial = typeof category === "string" ? category : undefined;
  return <>
    <PageIntro lang={lang} eyebrow={t.productsPage.eyebrow} title={t.productsPage.heading} description={t.productsPage.description} />
    <section className="section-pad"><div className="container"><div className="catalogue-download" data-reveal=""><div><strong>{t.productsPage.download}</strong><span>{t.productsPage.downloadNote}</span></div><a href={catalogueUrl} target="_blank" rel="noopener noreferrer" className="button button-blue">{t.productsPage.download} (PDF) <FileDown size={18} aria-hidden="true" /></a></div><ProductCatalogue key={initial} lang={lang} t={t.catalogue} categories={t.categories} products={products} initialCategory={initial} /></div></section>
    <ContactBanner lang={lang} />
  </>;
}
