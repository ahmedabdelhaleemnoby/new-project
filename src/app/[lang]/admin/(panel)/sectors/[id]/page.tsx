import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { adminLoad } from "@/lib/admin-load";
import type { AdminIndustry } from "@/lib/admin-shared";
import { NotReady } from "@/components/admin/cms/not-ready";
import { PageHead } from "@/components/admin/cms/page-head";
import { IndustryForm } from "@/components/admin/cms/industry-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/sectors/[id]">): Promise<Metadata> {
  return { title: (await getLocale(params)).t.cms.sectors.editTitle };
}

export default async function EditSector({ params }: PageProps<"/[lang]/admin/sectors/[id]">) {
  const { lang, t } = await getLocale(params);
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const result = await adminLoad<AdminIndustry>(lang, `/admin/industries/${id}`, { notFoundOn404: true });
  const back = { href: localePath(lang, "/admin/sectors"), label: t.cms.sectors.title };
  if ("notReady" in result) return <><PageHead title={t.cms.sectors.editTitle} back={back} /><NotReady t={t.cms} endpoint="GET /admin/industries/{id}" section="§3.2" /></>;
  if ("error" in result) return <><PageHead title={t.cms.sectors.editTitle} back={back} /><div className="form-error" role="alert"><p>{result.error}</p></div></>;
  return <>
    <PageHead eyebrow={t.cms.sectors.editTitle} title={result.data.name[lang] || result.data.name.en} back={back} />
    <IndustryForm lang={lang} t={t.cms} industry={result.data} id={result.data.id} />
  </>;
}
