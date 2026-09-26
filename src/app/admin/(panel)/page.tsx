import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AdminApiError, adminFetch, statusLabels, typeLabels, workflowStatuses, type Enquiry, type PageMeta } from "@/lib/admin-api";
import { enquiryTypes } from "@/lib/enquiry";
import { formatDate } from "@/components/admin/format";

type Filters = { type?: string; workflow_status?: string; search?: string; date_from?: string; date_to?: string; sort?: string; page?: string };
export const metadata: Metadata = { title: "Enquiries" };

const sorts = { newest: ["created_at", "desc"], oldest: ["created_at", "asc"], updated: ["updated_at", "desc"], status: ["workflow_status", "asc"] } as const;

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Filters> }) {
  const filters = await searchParams;
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const type = enquiryTypes.find(t => t === filters.type) ?? "";
  const status = workflowStatuses.find(s => s === filters.workflow_status) ?? "";
  const search = text(filters.search).slice(0, 120);
  const from = /^\d{4}-\d{2}-\d{2}$/.test(text(filters.date_from)) ? text(filters.date_from) : "";
  const to = /^\d{4}-\d{2}-\d{2}$/.test(text(filters.date_to)) ? text(filters.date_to) : "";
  const sort = (Object.keys(sorts) as (keyof typeof sorts)[]).find(s => s === filters.sort) ?? "newest";
  const page = Math.max(1, Number.parseInt(text(filters.page), 10) || 1);

  const query = new URLSearchParams({ page: String(page), per_page: "25", sort_by: sorts[sort][0], sort_dir: sorts[sort][1] });
  if (type) query.set("type", type);
  if (status) query.set("workflow_status", status);
  if (search) query.set("search", search);
  if (from) query.set("date_from", `${from}T00:00:00Z`);
  if (to) query.set("date_to", `${to}T23:59:59Z`);

  let result: { data: Enquiry[]; meta: PageMeta } | null = null;
  let error: string | null = null;
  try {
    result = await adminFetch(`/admin/enquiries?${query}`);
  } catch (e) {
    if (!(e instanceof AdminApiError)) throw e;
    error = e.message;
  }

  const link = (changes: Partial<Filters>) => {
    const params = new URLSearchParams(Object.entries({ type, workflow_status: status, search, date_from: from, date_to: to, sort: sort === "newest" ? "" : sort, page: String(page), ...changes }).filter(([, v]) => v && v !== "1") as [string, string][]);
    return `/admin${params.size ? `?${params}` : ""}`;
  };
  const filtered = Boolean(type || status || search || from || to);

  return <>
    <div className="admin-heading">
      <div><p className="eyebrow">Enquiry management</p><h1>Enquiries</h1></div>
      {result && <p className="admin-count" role="status">{result.meta.total} {result.meta.total === 1 ? "enquiry" : "enquiries"}{filtered ? " match these filters" : ""}</p>}
    </div>

    <form className="admin-filters" action="/admin" role="search" aria-label="Filter enquiries">
      <div className="field admin-search">
        <label htmlFor="f-search">Search</label>
        <div className="admin-input-icon"><Search size={16} aria-hidden="true" /><input id="f-search" name="search" defaultValue={search} placeholder="Name, email, company or reference" maxLength={120} /></div>
      </div>
      <div className="field"><label htmlFor="f-type">Type</label><select id="f-type" name="type" defaultValue={type}><option value="">All types</option>{enquiryTypes.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}</select></div>
      <div className="field"><label htmlFor="f-status">Status</label><select id="f-status" name="workflow_status" defaultValue={status}><option value="">All statuses</option>{workflowStatuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}</select></div>
      <div className="field"><label htmlFor="f-from">From</label><input id="f-from" name="date_from" type="date" defaultValue={from} /></div>
      <div className="field"><label htmlFor="f-to">To</label><input id="f-to" name="date_to" type="date" defaultValue={to} /></div>
      <div className="field"><label htmlFor="f-sort">Sort</label><select id="f-sort" name="sort" defaultValue={sort}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="updated">Recently updated</option><option value="status">Status</option></select></div>
      <div className="admin-filter-actions"><button type="submit" className="button button-blue">Apply</button>{filtered && <Link href="/admin" className="button button-outline">Clear</Link>}</div>
    </form>

    {error && <div className="form-error" role="alert"><p>{error}</p></div>}

    {result && (result.data.length === 0
      ? <div className="admin-empty"><h2>No enquiries found</h2><p>{filtered ? "Try different filters or clear them to see all enquiries." : "New enquiries from the website will appear here."}</p></div>
      : <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th scope="col">Reference</th><th scope="col">Received</th><th scope="col">Type</th><th scope="col">From</th><th scope="col">Topic</th><th scope="col">Status</th><th scope="col">Assigned</th></tr></thead>
          <tbody>{result.data.map(e => <tr key={e.reference}>
            <td>{e.id != null ? <Link href={`/admin/enquiries/${e.id}`} className="admin-ref">{e.reference}</Link> : <span className="admin-ref" title="The API did not return an ID for this enquiry, so it can’t be opened.">{e.reference}</span>}</td>
            <td className="admin-nowrap">{formatDate(e.created_at)}</td>
            <td><span className={`admin-type admin-type-${e.type}`}>{typeLabels[e.type] ?? e.type}</span></td>
            <td><strong>{e.name}</strong><small>{e.company ?? e.email}</small></td>
            <td className="admin-topic">{e.topic ?? e.product_slug ?? "—"}</td>
            <td><span className={`admin-status admin-status-${e.workflow_status}`}>{statusLabels[e.workflow_status] ?? e.workflow_status}</span></td>
            <td>{e.assigned_to != null ? `#${e.assigned_to}` : <span className="admin-muted">Unassigned</span>}</td>
          </tr>)}</tbody>
        </table>
      </div>)}

    {result && result.meta.last_page > 1 && <nav className="admin-pagination" aria-label="Pagination">
      {page > 1 ? <Link href={link({ page: String(page - 1) })} className="button button-outline"><ChevronLeft size={16} aria-hidden="true" /> Previous</Link> : <span />}
      <span>Page {result.meta.current_page} of {result.meta.last_page}</span>
      {page < result.meta.last_page ? <Link href={link({ page: String(page + 1) })} className="button button-outline">Next <ChevronRight size={16} aria-hidden="true" /></Link> : <span />}
    </nav>}
  </>;
}
