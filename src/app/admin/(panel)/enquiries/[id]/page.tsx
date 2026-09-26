import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { AdminApiError, adminFetch, statusLabels, typeLabels, type Enquiry, type NotificationJob } from "@/lib/admin-api";
import { EnquiryUpdateForm } from "@/components/admin/enquiry-update-form";
import { RetryButton } from "@/components/admin/retry-button";
import { formatDate } from "@/components/admin/format";

export const metadata: Metadata = { title: "Enquiry" };

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  if (!/^\d+$/.test(raw)) notFound();
  const id = Number(raw);

  let enquiry: Enquiry;
  try {
    enquiry = (await adminFetch<{ data: Enquiry }>(`/admin/enquiries/${id}`)).data;
  } catch (e) {
    if (!(e instanceof AdminApiError)) throw e;
    if (e.status === 404) notFound();
    return <><Link href="/admin" className="admin-back"><ArrowLeft size={16} aria-hidden="true" /> All enquiries</Link><div className="form-error" role="alert"><p>{e.message}</p></div></>;
  }

  let notifications: NotificationJob[] = [];
  let notificationError: string | null = null;
  try {
    notifications = (await adminFetch<{ data: NotificationJob[] }>(`/admin/enquiries/${id}/notifications`)).data;
  } catch (e) {
    if (!(e instanceof AdminApiError)) throw e;
    notificationError = e.message;
  }

  return <>
    <Link href="/admin" className="admin-back"><ArrowLeft size={16} aria-hidden="true" /> All enquiries</Link>
    <div className="admin-heading">
      <div>
        <p className="eyebrow">{typeLabels[enquiry.type] ?? enquiry.type} enquiry · {formatDate(enquiry.created_at)}</p>
        <h1>{enquiry.reference}</h1>
      </div>
      <span className={`admin-status admin-status-${enquiry.workflow_status}`}>{statusLabels[enquiry.workflow_status] ?? enquiry.workflow_status}</span>
    </div>

    <div className="admin-detail">
      <section className="admin-card" aria-labelledby="enquiry-message">
        <h2 id="enquiry-message">Message</h2>
        {(enquiry.topic || enquiry.product_slug) && <p className="admin-topic-line">{enquiry.topic}{enquiry.product_slug && <> · <Link href={`/products/${enquiry.product_slug}`} target="_blank">{enquiry.product_slug}</Link></>}</p>}
        <p className="admin-message">{enquiry.message}</p>
        <dl className="admin-facts">
          <div><dt>Name</dt><dd>{enquiry.name}</dd></div>
          <div><dt>Company</dt><dd>{enquiry.company ?? "—"}</dd></div>
          <div><dt>Email</dt><dd><a href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: your enquiry ${enquiry.reference}`)}`}><Mail size={14} aria-hidden="true" /> {enquiry.email}</a></dd></div>
          <div><dt>Phone</dt><dd>{enquiry.phone ? <a href={`tel:${enquiry.phone.replace(/[^\d+]/g, "")}`}><Phone size={14} aria-hidden="true" /> {enquiry.phone}</a> : "—"}</dd></div>
          <div><dt>Last updated</dt><dd>{formatDate(enquiry.updated_at)}</dd></div>
        </dl>
      </section>

      <aside className="admin-card" aria-labelledby="enquiry-follow-up">
        <h2 id="enquiry-follow-up">Follow-up</h2>
        <EnquiryUpdateForm id={id} status={enquiry.workflow_status} assignedTo={enquiry.assigned_to} />
      </aside>
    </div>

    <section className="admin-card admin-notifications" aria-labelledby="enquiry-notifications">
      <h2 id="enquiry-notifications">Email notifications</h2>
      {notificationError ? <div className="form-error" role="alert"><p>{notificationError}</p></div>
        : notifications.length === 0 ? <p className="admin-muted">No notifications have been created for this enquiry.</p>
        : <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th scope="col">Recipients</th><th scope="col">Status</th><th scope="col">Attempts</th><th scope="col">Next attempt</th><th scope="col">Last error</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr></thead>
          <tbody>{notifications.map(n => <tr key={n.id}>
            <td>{n.recipient_group}</td>
            <td><span className={`admin-status admin-job-${n.status}`}>{n.status.replace(/_/g, " ")}</span></td>
            <td>{n.attempt_count} / {n.max_attempts}</td>
            <td className="admin-nowrap">{formatDate(n.next_attempt_at)}</td>
            <td className="admin-topic">{n.last_error ?? "—"}</td>
            <td>{n.status === "failed" && <RetryButton enquiryId={id} notificationId={n.id} />}</td>
          </tr>)}</tbody>
        </table></div>}
    </section>
  </>;
}
