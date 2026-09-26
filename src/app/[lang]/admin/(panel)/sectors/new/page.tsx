import type { Metadata } from "next";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { PageHead } from "@/components/admin/cms/page-head";
import { emptyIndustry, IndustryForm } from "@/components/admin/cms/industry-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/sectors/new">): Promise<Metadata> {
  return { title: (await getLocale(params)).t.cms.sectors.new };
}

export default async function NewSector({ params }: PageProps<"/[lang]/admin/sectors/new">) {
  const { lang, t } = await getLocale(params);
  return <>
    <PageHead title={t.cms.sectors.new} back={{ href: localePath(lang, "/admin/sectors"), label: t.cms.sectors.title }} />
    <IndustryForm lang={lang} t={t.cms} industry={emptyIndustry} id={null} />
  </>;
}
