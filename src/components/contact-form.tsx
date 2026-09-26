"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { fill, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { submitEnquiry, type EnquiryResult, type EnquiryType } from "@/lib/enquiry";

type Failure = Exclude<EnquiryResult, { ok: true }>;
type Status = { state: "idle" } | { state: "sending" } | { state: "sent"; reference: string } | { state: "error"; result: Failure };

export function ContactForm({ lang, t, email, type = "sales", productSlug = null, initialTopic = "" }: { lang: Locale; t: Dictionary["form"]; email: string; type?: EnquiryType; productSlug?: string | null; initialTopic?: string }) {
  const id = useId();
  const isCareerEnquiry = type === "career";
  const [status, setStatus] = useState<Status>({ state: "idle" });
  // One key per submission attempt: reused on retries of unchanged content, replaced after edits or success.
  const idempotencyKey = useRef<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const fieldErrors = status.state === "error" && status.result.kind === "validation" ? status.result.fields : {};

  function errorMessage(result: Failure) {
    switch (result.kind) {
      case "validation": return t.checkFields;
      case "network": return fill(t.network, { email });
      case "conflict": return t.conflict;
      case "too-large": return t.tooLarge;
      case "rate-limit": {
        const s = result.retryAfter;
        const wait = s === null ? t.fewMinutes : s < 90 ? fill(t.seconds, { count: Math.ceil(s) }) : fill(t.minutes, { count: Math.ceil(s / 60) });
        return fill(t.rateLimit, { wait });
      }
      default: return fill(t.unavailable, { email });
    }
  }

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
    const raw = fieldErrors[name] ?? (name === "topic" ? fieldErrors.productSlug : undefined);
    // API validation messages are in English; show them there and a localized prompt otherwise.
    const error = raw === undefined ? undefined : lang === "en" && raw ? raw : t.invalidField;
    return {
      id: `${id}-${name}`,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${id}-${name}-error` : undefined,
      error: error ? <span className="field-error" id={`${id}-${name}-error`}>{error}</span> : null,
    };
  }
  const f = { name: field("name"), company: field("company"), email: field("email"), phone: field("phone"), topic: field("topic"), message: field("message") };
  const sending = status.state === "sending";
  const required = <span aria-hidden="true">*</span>;
  const optionalLabel = <span>{t.optional}</span>;

  if (status.state === "sent") return (
    <div className="inquiry-form">
      <div className="form-success" role="status">
        <p className="form-success-title"><Check size={18} aria-hidden="true" /> {t.sentTitle}</p>
        <p>{fill(t.sentReference, { reference: status.reference })}</p>
        <button type="button" className="button button-outline" onClick={() => setStatus({ state: "idle" })}>{t.sendAnother}</button>
      </div>
    </div>
  );

  return (
    <form
      className="inquiry-form"
      aria-label={isCareerEnquiry ? t.labelCareer : type === "technical" ? t.labelTechnical : t.labelSales}
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
          <label htmlFor={f.name.id}>{t.name} {required}</label>
          <input id={f.name.id} name="name" aria-invalid={f.name["aria-invalid"]} aria-describedby={f.name["aria-describedby"]} autoComplete="name" placeholder={t.namePlaceholder} required maxLength={120} />
          {f.name.error}
        </div>
        <div className="field">
          <label htmlFor={f.company.id}>{t.company} {isCareerEnquiry ? optionalLabel : required}</label>
          <input id={f.company.id} name="company" aria-invalid={f.company["aria-invalid"]} aria-describedby={f.company["aria-describedby"]} autoComplete="organization" placeholder={t.companyPlaceholder} required={!isCareerEnquiry} maxLength={160} />
          {f.company.error}
        </div>
        <div className="field">
          <label htmlFor={f.email.id}>{isCareerEnquiry ? t.email : t.workEmail} {required}</label>
          <input id={f.email.id} name="email" dir="ltr" aria-invalid={f.email["aria-invalid"]} aria-describedby={f.email["aria-describedby"]} type="email" autoComplete="email" placeholder={isCareerEnquiry ? t.emailPlaceholderCareer : t.emailPlaceholder} required maxLength={254} />
          {f.email.error}
        </div>
        <div className="field">
          <label htmlFor={f.phone.id}>{t.phone} {optionalLabel}</label>
          <input id={f.phone.id} name="phone" dir="ltr" aria-invalid={f.phone["aria-invalid"]} aria-describedby={f.phone["aria-describedby"]} type="tel" autoComplete="tel" placeholder={t.phonePlaceholder} maxLength={50} />
          {f.phone.error}
        </div>
        <div className="field field-wide">
          <label htmlFor={f.topic.id}>{isCareerEnquiry ? t.topicCareer : t.topic} {optionalLabel}</label>
          <input id={f.topic.id} name="topic" aria-invalid={f.topic["aria-invalid"]} aria-describedby={f.topic["aria-describedby"]} defaultValue={initialTopic} placeholder={isCareerEnquiry ? t.topicPlaceholderCareer : t.topicPlaceholder} maxLength={160} />
          {f.topic.error}
        </div>
        <div className="field field-wide">
          <label htmlFor={f.message.id}>{t.message} {required}</label>
          <textarea id={f.message.id} name="message" aria-invalid={f.message["aria-invalid"]} aria-describedby={f.message["aria-describedby"]} placeholder={isCareerEnquiry ? t.messagePlaceholderCareer : t.messagePlaceholder} rows={5} required maxLength={4000} />
          {f.message.error}
        </div>
        <div className="form-honeypot" aria-hidden="true">
          <label htmlFor={`${id}-website`}>{t.honeypot}</label>
          <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      {status.state === "error" && (
        <div className="form-error" role="alert" tabIndex={-1} ref={errorRef}>
          <p>{errorMessage(status.result)}</p>
          {status.result.kind !== "validation" && <a href={`mailto:${email}`}>{fill(t.emailInstead, { email })} <ArrowUpRight size={14} aria-hidden="true" /></a>}
        </div>
      )}

      <button type="submit" className="button button-blue" disabled={sending}>
        {sending ? <>{t.sending} <LoaderCircle size={18} className="spin" aria-hidden="true" /></> : <>{t.send} <ArrowUpRight size={18} aria-hidden="true" /></>}
      </button>
      <p className="form-note" id={`${id}-note`}>{isCareerEnquiry ? t.noteCareer : t.note}</p>
    </form>
  );
}
