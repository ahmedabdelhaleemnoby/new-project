import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { fill, localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { AdminApiError, adminErrorMessage, adminFetch, type Enquiry, type NotificationJob } from "@/lib/admin-api";
import { EnquiryUpdateForm } from "@/components/admin/enquiry-update-form";
import { RetryButton } from "@/components/admin/retry-button";
import { formatDate } from "@/components/admin/format";
import { adminLoad } from "@/lib/admin-load";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/enquiries/[id]">): Promise<Metadata> {
  const { t } = await getLocale(params);
  return { title: t.admin.enquiryTitle };
}

export default async function EnquiryPage({ params }: PageProps<"/[lang]/admin/enquiries/[id]">) {
  const { lang, t: dict } = await getLocale(params);
  const t = dict.admin;
  const { id: raw } = await params;
  if (!/^\d+$/.test(raw)) notFound();
  const id = Number(raw);
  const back = <Link href={localePath(lang, "/admin")} className="admin-back"><ArrowLeft size={16} aria-hidden="true" /> {t.back}</Link>;

  let enquiry: Enquiry;
  try {
    enquiry = (await adminFetch<{ data: Enquiry }>(lang, `/admin/enquiries/${id}`)).data;
  } catch (e) {
    if (!(e instanceof AdminApiError)) throw e;
    if (e.status === 404) notFound();
    return <>{back}<div className="form-error" role="alert"><p>{adminErrorMessage(e, lang, t)}</p></div></>;
  }

  let notifications: NotificationJob[] = [];
  let notificationError: string | null = null;
  try {
    notifications = (await adminFetch<{ data: NotificationJob[] }>(lang, `/admin/enquiries/${id}/notifications`)).data;
  } catch (e) {
    if (!(e instanceof AdminApiError)) throw e;
    notificationError = adminErrorMessage(e, lang, t);
  }

  const staffOptions = await adminLoad<{ id: number; name: string }[]>(lang, "/admin/staff/options");

  return <>
    {back}
    <div className="admin-heading">
      <div>
        <p className="eyebrow">{fill(t.enquiryEyebrow, { type: t.types[enquiry.type] ?? enquiry.type, date: formatDate(enquiry.created_at, lang) })}</p>
        <h1 dir="ltr">{enquiry.reference}</h1>
      </div>
      <span className={`admin-status admin-status-${enquiry.workflow_status}`}>{t.statuses[enquiry.workflow_status] ?? enquiry.workflow_status}</span>
    </div>

    <div className="admin-detail">
      <section className="admin-card" aria-labelledby="enquiry-message">
        <h2 id="enquiry-message">{t.message}</h2>
        {(enquiry.topic || enquiry.product_slug) && <p className="admin-topic-line">{enquiry.topic}{enquiry.product_slug && <> · <Link href={localePath(lang, `/products/${enquiry.product_slug}`)} target="_blank">{enquiry.product_slug}</Link></>}</p>}
        <p className="admin-message" dir="auto">{enquiry.message}</p>
        <dl className="admin-facts">
          <div><dt>{t.name}</dt><dd dir="auto">{enquiry.name}</dd></div>
          <div><dt>{t.company}</dt><dd dir="auto">{enquiry.company ?? "—"}</dd></div>
          <div><dt>{t.email}</dt><dd><a href={`mailto:${enquiry.email}?subject=${encodeURIComponent(fill(t.replySubject, { reference: enquiry.reference }))}`} dir="ltr"><Mail size={14} aria-hidden="true" /> {enquiry.email}</a></dd></div>
          <div><dt>{t.phone}</dt><dd>{enquiry.phone ? <a href={`tel:${enquiry.phone.replace(/[^\d+]/g, "")}`} dir="ltr"><Phone size={14} aria-hidden="true" /> {enquiry.phone}</a> : "—"}</dd></div>
          <div><dt>{t.updated}</dt><dd>{formatDate(enquiry.updated_at, lang)}</dd></div>
        </dl>
      </section>

      <aside className="admin-card" aria-labelledby="enquiry-follow-up">
        <h2 id="enquiry-follow-up">{t.followUp}</h2>
        <EnquiryUpdateForm lang={lang} t={t} assignLabel={dict.cms.assignTo} staff={"data" in staffOptions ? staffOptions.data : null} id={id} status={enquiry.workflow_status} assignedTo={enquiry.assigned_to} />
      </aside>
    </div>

    <section className="admin-card admin-notifications" aria-labelledby="enquiry-notifications">
      <h2 id="enquiry-notifications">{t.notifications}</h2>
      {notificationError ? <div className="form-error" role="alert"><p>{notificationError}</p></div>
        : notifications.length === 0 ? <p className="admin-muted">{t.noNotifications}</p>
        : <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th scope="col">{t.colRecipients}</th><th scope="col">{t.colStatus}</th><th scope="col">{t.colAttempts}</th><th scope="col">{t.colNextAttempt}</th><th scope="col">{t.colLastError}</th><th scope="col"><span className="visually-hidden">{t.colActions}</span></th></tr></thead>
          <tbody>{notifications.map(n => <tr key={n.id}>
            <td>{n.recipient_group}</td>
            <td><span className={`admin-status admin-job-${n.status}`}>{n.status.replace(/_/g, " ")}</span></td>
            <td dir="ltr">{n.attempt_count} / {n.max_attempts}</td>
            <td className="admin-nowrap">{formatDate(n.next_attempt_at, lang)}</td>
            <td className="admin-topic" dir="auto">{n.last_error ?? "—"}</td>
            <td>{n.status === "failed" && <RetryButton lang={lang} t={t} enquiryId={id} notificationId={n.id} />}</td>
          </tr>)}</tbody>
        </table></div>}
    </section>
  </>;
}
