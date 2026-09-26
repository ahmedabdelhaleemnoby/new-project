import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { adminLoad } from "@/lib/admin-load";
import type { AdminIndustry } from "@/lib/admin-shared";
import { IndustryIcon } from "@/components/industry-icon";
import { formatDate } from "@/components/admin/format";
import { NotReady } from "@/components/admin/cms/not-ready";
import { PageHead } from "@/components/admin/cms/page-head";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/sectors">): Promise<Metadata> {
  return { title: (await getLocale(params)).t.cms.sectors.title };
}

export default async function SectorsAdmin({ params }: PageProps<"/[lang]/admin/sectors">) {
  const { lang, t } = await getLocale(params);
  const c = t.cms;
  const result = await adminLoad<AdminIndustry[]>(lang, "/admin/industries");
  return <>
    <PageHead eyebrow={c.nav.sectors} title={c.sectors.title} action={{ href: localePath(lang, "/admin/sectors/new"), label: c.sectors.new }} />
    {"notReady" in result ? <NotReady t={c} endpoint="GET /admin/industries" section="§3.2" />
      : "error" in result ? <div className="form-error" role="alert"><p>{result.error}</p></div>
      : result.data.length === 0 ? <div className="admin-empty"><p>{c.empty}</p></div>
      : <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th scope="col"><span className="visually-hidden">{c.sectors.icon}</span></th><th scope="col">{c.sectors.name}</th><th scope="col">{c.sectors.brochure}</th><th scope="col">{c.sortOrder}</th><th scope="col">{t.admin.colStatus}</th><th scope="col">{c.updated}</th></tr></thead>
        <tbody>{result.data.map(i => <tr key={i.id}>
          <td className="cms-icon-cell"><IndustryIcon type={i.icon} /></td>
          <td><Link href={localePath(lang, `/admin/sectors/${i.id}`)} className="admin-ref">{i.name[lang] || i.name.en}</Link><small dir="ltr">{i.slug}</small></td>
          <td>{i.brochure_url ? <a href={i.brochure_url} target="_blank" rel="noopener noreferrer" aria-label={c.sectors.brochure}><FileText size={16} /></a> : "—"}</td>
          <td>{i.sort_order}</td>
          <td><span className={`admin-status ${i.published ? "admin-status-closed" : "admin-status-spam"}`}>{i.published ? c.published : c.draft}</span></td>
          <td className="admin-nowrap">{formatDate(i.updated_at ?? null, lang)}</td>
        </tr>)}</tbody>
      </table></div>}
  </>;
}
