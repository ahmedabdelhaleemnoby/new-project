import type { Metadata } from "next";
import { ArrowUpRight, Building2, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageIntro } from "@/components/page-intro";
import { getLocale } from "@/i18n/dictionaries";
import { getProducts, getSettings } from "@/lib/content";
import { resolveEnquiryPrefill } from "@/lib/enquiry";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { t } = await getLocale(params);
  return { title: t.contact.title, description: t.contact.description };
}

export default async function ContactPage({ params, searchParams }: PageProps<"/[lang]/contact">) {
  const { lang, t } = await getLocale(params);
  const c = t.contact;
  const query = await searchParams;
  const text = (value: unknown) => (typeof value === "string" ? value : undefined);
  const [products, site] = await Promise.all([getProducts(lang), getSettings(lang)]);
  const prefill = resolveEnquiryPrefill(products, { type: text(query.type), product: text(query.product), topic: text(query.topic) });

  return (
    <>
      <PageIntro lang={lang} eyebrow={c.eyebrow} title={c.heading} description={c.intro} />
      <section className="section-pad">
        <div className="container contact-grid">
          <div className="contact-details" data-stagger="">
            <p className="eyebrow">{c.detailsEyebrow}</p>
            <h2>{c.detailsTitle[0]}<br />{c.detailsTitle[1]}</h2>
            <p>{c.detailsText}</p>

            <div className="contact-detail">
              <Mail size={22} aria-hidden="true" />
              <div><h3>{c.sales}</h3><a href={`mailto:${site.email}`}>{site.email}</a></div>
            </div>
            {site.secondaryEmail && <div className="contact-detail">
              <Mail size={22} aria-hidden="true" />
              <div><h3>{site.secondaryEmail.label}</h3><a href={`mailto:${site.secondaryEmail.email}`}>{site.secondaryEmail.email}</a></div>
            </div>}
            {site.phone && <div className="contact-detail">
              <Phone size={22} aria-hidden="true" />
              <div><h3>{c.call}</h3><a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} dir="ltr">{site.phone}</a></div>
            </div>}
            {site.address && <div className="contact-detail">
              <MapPin size={22} aria-hidden="true" />
              <div>
                <h3>{c.findUs}</h3>
                <p>{site.address.lines.map((line, i) => <span key={i}>{line}<br /></span>)}</p>
                <a className="text-link" href={site.address.mapUrl} target="_blank" rel="noopener noreferrer">{c.map} <ArrowUpRight size={16} aria-hidden="true" /></a>
              </div>
            </div>}
            <div className="contact-detail">
              <Building2 size={22} aria-hidden="true" />
              <div>
                <h3>{c.company}</h3>
                <p>{site.fullName} · {site.legal.form}</p>
                <dl className="legal-list">
                  <div><dt>{c.commercialRegister}</dt><dd dir="ltr">{site.legal.commercialRegister}</dd></div>
                  <div><dt>{c.taxCard}</dt><dd dir="ltr">{site.legal.taxCard}</dd></div>
                </dl>
              </div>
            </div>
          </div>

          <div data-reveal="end">
            <p className="eyebrow">{c.formEyebrow}</p>
            <ContactForm key={`${prefill.type}:${prefill.productSlug}:${prefill.topic}`} lang={lang} t={t.form} email={site.email} type={prefill.type} productSlug={prefill.productSlug} initialTopic={prefill.topic} />
          </div>
        </div>
      </section>
    </>
  );
}
