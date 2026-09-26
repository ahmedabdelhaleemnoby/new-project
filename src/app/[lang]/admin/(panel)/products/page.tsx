import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { adminLoad } from "@/lib/admin-load";
import type { AdminProduct } from "@/lib/admin-shared";
import { formatDate } from "@/components/admin/format";
import { NotReady } from "@/components/admin/cms/not-ready";
import { PageHead } from "@/components/admin/cms/page-head";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/products">): Promise<Metadata> {
  return { title: (await getLocale(params)).t.cms.products.title };
}

export default async function ProductsAdmin({ params }: PageProps<"/[lang]/admin/products">) {
  const { lang, t } = await getLocale(params);
  const c = t.cms;
  const result = await adminLoad<AdminProduct[]>(lang, "/admin/products");
  return <>
    <PageHead eyebrow={c.nav.products} title={c.products.title} action={{ href: localePath(lang, "/admin/products/new"), label: c.products.new }} />
    {"notReady" in result ? <NotReady t={c} endpoint="GET /admin/products" section="§3.1" />
      : "error" in result ? <div className="form-error" role="alert"><p>{result.error}</p></div>
      : result.data.length === 0 ? <div className="admin-empty"><p>{c.empty}</p></div>
      : <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th scope="col"><span className="visually-hidden">{c.products.image}</span></th><th scope="col">{c.products.name}</th><th scope="col">{c.products.category}</th><th scope="col">{c.sortOrder}</th><th scope="col">{t.admin.colStatus}</th><th scope="col">{c.updated}</th></tr></thead>
        <tbody>{result.data.map(p => <tr key={p.id}>
          <td className="cms-thumb-cell">{p.image && <img src={p.image} alt="" />}</td>
          <td><Link href={localePath(lang, `/admin/products/${p.id}`)} className="admin-ref">{p.name[lang] || p.name.en}</Link><small dir="ltr">{p.slug}</small></td>
          <td>{t.categories[p.category]}</td>
          <td>{p.sort_order}</td>
          <td><span className={`admin-status ${p.published ? "admin-status-closed" : "admin-status-spam"}`}>{p.published ? c.published : c.draft}</span></td>
          <td className="admin-nowrap">{formatDate(p.updated_at ?? null, lang)}</td>
        </tr>)}</tbody>
      </table></div>}
  </>;
}
