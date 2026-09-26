import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { adminLoad } from "@/lib/admin-load";
import type { StaffMember } from "@/lib/admin-shared";
import { NotReady } from "@/components/admin/cms/not-ready";
import { PageHead } from "@/components/admin/cms/page-head";
import { StaffForm } from "@/components/admin/cms/staff-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/staff/[id]">): Promise<Metadata> {
  return { title: (await getLocale(params)).t.cms.staff.title };
}

export default async function EditStaff({ params }: PageProps<"/[lang]/admin/staff/[id]">) {
  const { lang, t } = await getLocale(params);
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  // The spec has no single-staff endpoint, so read the list and pick the member.
  const result = await adminLoad<StaffMember[]>(lang, "/admin/staff");
  const back = { href: localePath(lang, "/admin/staff"), label: t.cms.staff.title };
  if ("notReady" in result) return <><PageHead title={t.cms.staff.title} back={back} /><NotReady t={t.cms} endpoint="GET /admin/staff" section="§3.6" /></>;
  if ("error" in result) return <><PageHead title={t.cms.staff.title} back={back} /><div className="form-error" role="alert"><p>{result.error}</p></div></>;
  const member = result.data.find(m => m.id === Number(id));
  if (!member) notFound();
  return <>
    <PageHead eyebrow={t.cms.staff.title} title={member.name} back={back} />
    <StaffForm lang={lang} t={t.cms} member={member} />
  </>;
}
