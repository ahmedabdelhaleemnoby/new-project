"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { submitEnquiry, type EnquiryResult, type EnquiryType } from "@/lib/enquiry";

type Status = { state: "idle" } | { state: "sending" } | { state: "sent"; reference: string } | { state: "error"; result: Exclude<EnquiryResult, { ok: true }> };

export function ContactForm({ type = "sales", productSlug = null, initialTopic = "" }: { type?: EnquiryType; productSlug?: string | null; initialTopic?: string }) {
  const id = useId();
  const isCareerEnquiry = type === "career";
  const [status, setStatus] = useState<Status>({ state: "idle" });
  // One key per submission attempt: reused on retries of unchanged content, replaced after edits or success.
  const idempotencyKey = useRef<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const fieldErrors = status.state === "error" && status.result.kind === "validation" ? status.result.fields : {};

  async function sendEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.state === "sending") return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const optional = (key: string) => value(key) || null;
    idempotencyKey.current ??= crypto.randomUUID();
    setStatus({ state: "sending" });

    const result = await submitEnquiry({
      type,
      name: value("name"),
      email: value("email"),
      company: optional("company"),
      phone: optional("phone"),
      productSlug,
      topic: optional("topic"),
      message: value("message"),
      website: optional("website"),
    }, idempotencyKey.current);

    if (result.ok) {
      idempotencyKey.current = null;
      form.reset();
      setStatus({ state: "sent", reference: result.reference });
      return;
    }
    if (result.kind === "conflict" || result.kind === "validation") idempotencyKey.current = null;
    setStatus({ state: "error", result });
    requestAnimationFrame(() => {
      const firstInvalid = result.kind === "validation" && form.querySelector<HTMLElement>("[aria-invalid=true]");
      (firstInvalid || errorRef.current)?.focus();
    });
  }

  function field(name: string) {
    const error = fieldErrors[name] ?? (name === "topic" ? fieldErrors.productSlug : undefined);
    return {
      id: `${id}-${name}`,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${id}-${name}-error` : undefined,
      error: error ? <span className="field-error" id={`${id}-${name}-error`}>{error}</span> : null,
    };
  }
  const f = { name: field("name"), company: field("company"), email: field("email"), phone: field("phone"), topic: field("topic"), message: field("message") };
  const sending = status.state === "sending";

  if (status.state === "sent") return (
    <div className="inquiry-form">
      <div className="form-success" role="status">
        <p className="form-success-title"><Check size={18} aria-hidden="true" /> Thank you — your enquiry has been received.</p>
        <p>Your reference is <strong>{status.reference}</strong>. Our team will reply by email.</p>
        <button type="button" className="button button-outline" onClick={() => setStatus({ state: "idle" })}>Send another enquiry</button>
      </div>
    </div>
  );

  return (
    <form
      className="inquiry-form"
      aria-label={isCareerEnquiry ? "Career enquiry" : type === "technical" ? "Technical enquiry" : "Product enquiry"}
      aria-describedby={`${id}-note`}
      aria-busy={sending}
      onSubmit={sendEnquiry}
      onChange={() => {
        idempotencyKey.current = null;
        if (status.state === "error" && status.result.kind !== "validation") setStatus({ state: "idle" });
      }}
    >
      <div className="form-grid">
        <div className="field">
          <label htmlFor={f.name.id}>Full name <span aria-hidden="true">*</span></label>
          <input id={f.name.id} name="name" aria-invalid={f.name["aria-invalid"]} aria-describedby={f.name["aria-describedby"]} autoComplete="name" placeholder="Your full name" required maxLength={120} />
          {f.name.error}
        </div>
        <div className="field">
          <label htmlFor={f.company.id}>Company {isCareerEnquiry ? <span>(optional)</span> : <span aria-hidden="true">*</span>}</label>
          <input id={f.company.id} name="company" aria-invalid={f.company["aria-invalid"]} aria-describedby={f.company["aria-describedby"]} autoComplete="organization" placeholder="Company name" required={!isCareerEnquiry} maxLength={160} />
          {f.company.error}
        </div>
        <div className="field">
          <label htmlFor={f.email.id}>{isCareerEnquiry ? "Email" : "Work email"} <span aria-hidden="true">*</span></label>
          <input id={f.email.id} name="email" aria-invalid={f.email["aria-invalid"]} aria-describedby={f.email["aria-describedby"]} type="email" autoComplete="email" placeholder={isCareerEnquiry ? "you@example.com" : "you@company.com"} required maxLength={254} />
          {f.email.error}
        </div>
        <div className="field">
          <label htmlFor={f.phone.id}>Phone <span>(optional)</span></label>
          <input id={f.phone.id} name="phone" aria-invalid={f.phone["aria-invalid"]} aria-describedby={f.phone["aria-describedby"]} type="tel" autoComplete="tel" placeholder="Include country code" maxLength={50} />
          {f.phone.error}
        </div>
        <div className="field field-wide">
          <label htmlFor={f.topic.id}>{isCareerEnquiry ? "Area of interest" : "Product of interest"} <span>(optional)</span></label>
          <input id={f.topic.id} name="topic" aria-invalid={f.topic["aria-invalid"]} aria-describedby={f.topic["aria-describedby"]} defaultValue={initialTopic} placeholder={isCareerEnquiry ? "For example, production or engineering" : "Tell us what you’re looking for"} maxLength={160} />
          {f.topic.error}
        </div>
        <div className="field field-wide">
          <label htmlFor={f.message.id}>How can we help? <span aria-hidden="true">*</span></label>
          <textarea id={f.message.id} name="message" aria-invalid={f.message["aria-invalid"]} aria-describedby={f.message["aria-describedby"]} placeholder={isCareerEnquiry ? "Tell us about your experience, the type of role you’re interested in, and your location…" : "Share your application, quantity, or project requirements…"} rows={5} required maxLength={4000} />
          {f.message.error}
        </div>
        <div className="form-honeypot" aria-hidden="true">
          <label htmlFor={`${id}-website`}>Leave this field empty</label>
          <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      {status.state === "error" && (
        <div className="form-error" role="alert" tabIndex={-1} ref={errorRef}>
          <p>{status.result.message}</p>
          {status.result.kind !== "validation" && <a href="mailto:sales@asfourmr.com">Email sales@asfourmr.com instead <ArrowUpRight size={14} aria-hidden="true" /></a>}
        </div>
      )}

      <button type="submit" className="button button-blue" disabled={sending}>
        {sending ? <>Sending… <LoaderCircle size={18} className="spin" aria-hidden="true" /></> : <>Send enquiry <ArrowUpRight size={18} aria-hidden="true" /></>}
      </button>
      <p className="form-note" id={`${id}-note`}>
        Fields marked * are required. We use your details only to respond to this enquiry{isCareerEnquiry ? " and consider you for future opportunities" : ""}.
      </p>
    </form>
  );
}
