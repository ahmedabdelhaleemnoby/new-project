import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { adminFetch, type Staff } from "@/lib/admin-api";
import { adminLoad } from "@/lib/admin-load";
import type { StaffMember } from "@/lib/admin-shared";
import { formatDate } from "@/components/admin/format";
import { NotReady } from "@/components/admin/cms/not-ready";
import { PageHead } from "@/components/admin/cms/page-head";
import { StaffActiveToggle, StaffForm } from "@/components/admin/cms/staff-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/staff">): Promise<Metadata> {
  return { title: (await getLocale(params)).t.cms.staff.title };
}

export default async function StaffAdmin({ params }: PageProps<"/[lang]/admin/staff">) {
  const { lang, t } = await getLocale(params);
  const c = t.cms;
  const [result, { staff: me }] = await Promise.all([adminLoad<StaffMember[]>(lang, "/admin/staff"), adminFetch<{ staff: Staff & { id?: number } }>(lang, "/admin/me")]);
  return <>
    <PageHead eyebrow={c.nav.staff} title={c.staff.title} />
    {"notReady" in result ? <NotReady t={c} endpoint="GET /admin/staff" section="§3.6" />
      : "error" in result ? <div className="form-error" role="alert"><p>{result.error}</p></div>
      : <>
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th scope="col">{c.staff.name}</th><th scope="col">{c.staff.role}</th><th scope="col">{t.admin.colStatus}</th><th scope="col">{c.staff.lastLogin}</th><th scope="col"><span className="visually-hidden">{t.admin.colActions}</span></th></tr></thead>
          <tbody>{result.data.map(member => {
            const isMe = member.id === me.id || member.email === me.email;
            return <tr key={member.id}>
              <td><Link href={localePath(lang, `/admin/staff/${member.id}`)} className="admin-ref">{member.name}</Link>{isMe && <span className="cms-badge">{c.staff.you}</span>}<small dir="ltr">{member.email}</small></td>
              <td>{c.staff.roles[member.role] ?? member.role}</td>
              <td><span className={`admin-status ${member.active ? "admin-status-closed" : "admin-status-spam"}`}>{member.active ? c.staff.active : c.staff.inactive}</span></td>
              <td className="admin-nowrap">{formatDate(member.last_login_at ?? null, lang)}</td>
              <td>{!isMe && <StaffActiveToggle lang={lang} t={c} member={member} />}</td>
            </tr>;
          })}</tbody>
        </table></div>
        <h2 className="cms-subtitle">{c.staff.new}</h2>
        <StaffForm lang={lang} t={c} member={null} />
      </>}
  </>;
}
