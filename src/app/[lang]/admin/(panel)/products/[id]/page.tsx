import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { adminLoad } from "@/lib/admin-load";
import type { AdminProduct } from "@/lib/admin-shared";
import { NotReady } from "@/components/admin/cms/not-ready";
import { PageHead } from "@/components/admin/cms/page-head";
import { ProductForm } from "@/components/admin/cms/product-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/products/[id]">): Promise<Metadata> {
  return { title: (await getLocale(params)).t.cms.products.editTitle };
}

export default async function EditProduct({ params }: PageProps<"/[lang]/admin/products/[id]">) {
  const { lang, t } = await getLocale(params);
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const result = await adminLoad<AdminProduct>(lang, `/admin/products/${id}`, { notFoundOn404: true });
  const back = { href: localePath(lang, "/admin/products"), label: t.cms.products.title };
  if ("notReady" in result) return <><PageHead title={t.cms.products.editTitle} back={back} /><NotReady t={t.cms} endpoint="GET /admin/products/{id}" section="§3.1" /></>;
  if ("error" in result) return <><PageHead title={t.cms.products.editTitle} back={back} /><div className="form-error" role="alert"><p>{result.error}</p></div></>;
  return <>
    <PageHead eyebrow={t.cms.products.editTitle} title={result.data.name[lang] || result.data.name.en} back={back} />
    <ProductForm lang={lang} t={t.cms} categories={t.categories} product={result.data} id={result.data.id} />
  </>;
}
