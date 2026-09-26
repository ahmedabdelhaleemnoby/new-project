"use client";

import { useId, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";

type EnquiryDraft = {
  href: string;
  text: string;
};

export function ContactForm({ initialProduct = "" }: { initialProduct?: string }) {
  const id = useId();
  const isCareerEnquiry = initialProduct === "Career enquiry";
  const [draft, setDraft] = useState<EnquiryDraft | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  function prepareEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const product = value("product");
    const subject = isCareerEnquiry
      ? `Career enquiry: ${value("name")}`
      : product ? `Product enquiry: ${product}` : "Product enquiry — Asfour M&R";
    const body = [
      "Hello Asfour M&R team,",
      "",
      value("message"),
      "",
      `Name: ${value("name")}`,
      ...(value("company") ? [`Company: ${value("company")}`] : []),
      `Email: ${value("email")}`,
      ...(value("phone") ? [`Phone: ${value("phone")}`] : []),
      ...(product ? [`${isCareerEnquiry ? "Enquiry type" : "Product of interest"}: ${product}`] : []),
    ].join("\n");

    setDraft({
      href: `mailto:sales@asfourmr.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      text: `To: sales@asfourmr.com\nSubject: ${subject}\n\n${body}`,
    });
    setCopyStatus("idle");
  }

  async function copyEnquiry() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.text);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <form
      className="inquiry-form"
      aria-label={isCareerEnquiry ? "Career enquiry" : "Product enquiry"}
      aria-describedby={`${id}-note`}
      onSubmit={prepareEnquiry}
      onChange={() => {
        setDraft(null);
        setCopyStatus("idle");
      }}
    >
      <div className="form-grid">
        <label className="field" htmlFor={`${id}-name`}>
          <span>Full name <span aria-hidden="true">*</span></span>
          <input id={`${id}-name`} name="name" autoComplete="name" placeholder="Your full name" required maxLength={120} />
        </label>
        <label className="field" htmlFor={`${id}-company`}>
          <span>Company {isCareerEnquiry ? <span>(optional)</span> : <span aria-hidden="true">*</span>}</span>
          <input id={`${id}-company`} name="company" autoComplete="organization" placeholder="Company name" required={!isCareerEnquiry} maxLength={160} />
        </label>
        <label className="field" htmlFor={`${id}-email`}>
          <span>{isCareerEnquiry ? "Email" : "Work email"} <span aria-hidden="true">*</span></span>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder={isCareerEnquiry ? "you@example.com" : "you@company.com"} required maxLength={254} />
        </label>
        <label className="field" htmlFor={`${id}-phone`}>
          <span>Phone <span>(optional)</span></span>
          <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" placeholder="Include country code" maxLength={50} />
        </label>
        <label className="field field-wide" htmlFor={`${id}-product`}>
          <span>{isCareerEnquiry ? "Enquiry type" : "Product of interest"} <span>(optional)</span></span>
          <input id={`${id}-product`} name="product" defaultValue={initialProduct} placeholder={isCareerEnquiry ? "Career enquiry" : "Tell us what you’re looking for"} maxLength={160} />
        </label>
        <label className="field field-wide" htmlFor={`${id}-message`}>
          <span>How can we help? <span aria-hidden="true">*</span></span>
          <textarea id={`${id}-message`} name="message" placeholder={isCareerEnquiry ? "Tell us about your experience, the type of role you’re interested in, and your location…" : "Share your application, quantity, or project requirements…"} rows={5} required maxLength={4000} />
        </label>
      </div>

      <button type="submit" className="button button-blue">
        Prepare enquiry <ArrowUpRight size={18} aria-hidden="true" />
      </button>
      <p className="form-note" id={`${id}-note`}>
        Fields marked * are required. Review and send your enquiry from your email app.
      </p>

      {draft && (
        <div className="form-success">
          <p role="status">Your enquiry is ready. Open your email app to send it.</p>
          <a className="button button-blue" href={draft.href}>
            Open email draft <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <button type="button" className="button button-outline" onClick={copyEnquiry}>
            {copyStatus === "copied" ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
            {copyStatus === "copied" ? "Enquiry copied" : "Copy enquiry"}
          </button>
          <p className="form-note" role="status">
            {copyStatus === "copied"
              ? "Copied. Paste your enquiry into an email to sales@asfourmr.com."
              : copyStatus === "failed"
                ? "Copy wasn’t available. Use the email draft link to continue."
                : "Your message is saved here only while this page is open."}
          </p>
        </div>
      )}
    </form>
  );
}
