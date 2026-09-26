import type { Metadata } from "next";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { PageHead } from "@/components/admin/cms/page-head";
import { emptyProduct, ProductForm } from "@/components/admin/cms/product-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/products/new">): Promise<Metadata> {
  return { title: (await getLocale(params)).t.cms.products.new };
}

export default async function NewProduct({ params }: PageProps<"/[lang]/admin/products/new">) {
  const { lang, t } = await getLocale(params);
  return <>
    <PageHead title={t.cms.products.new} back={{ href: localePath(lang, "/admin/products"), label: t.cms.products.title }} />
    <ProductForm lang={lang} t={t.cms} categories={t.categories} product={emptyProduct} id={null} />
  </>;
}
