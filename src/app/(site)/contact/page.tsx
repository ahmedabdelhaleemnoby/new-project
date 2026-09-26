import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageIntro } from "@/components/page-intro";
import { resolveEnquiryPrefill } from "@/lib/enquiry";
import { getProducts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Asfour M&R for product enquiries and project requirements. Connect with our sales team in Egypt and Europe.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; product?: string; topic?: string }>;
}) {
  const params = await searchParams;
  const text = (value: unknown) => (typeof value === "string" ? value : undefined);
  const prefill = resolveEnquiryPrefill(await getProducts(), { type: text(params.type), product: text(params.product), topic: text(params.topic) });

  return (
    <>
      <PageIntro
        eyebrow="Contact us"
        title="LET’S TALK MATERIALS."
        description="A product enquiry. A technical requirement. A new possibility. Tell us what you have in mind, and start a conversation with our team."
      />
      <section className="section-pad">
        <div className="container contact-grid">
          <div className="contact-details">
            <p className="eyebrow">THE RIGHT CONNECTION</p>
            <h2>Good things start<br />with a conversation.</h2>
            <p>Reach us directly, or send an enquiry with the form. We look forward to hearing about your requirements.</p>

            <div className="contact-detail">
              <Mail size={22} aria-hidden="true" />
              <div>
                <h3>Sales enquiries</h3>
                <a href="mailto:sales@asfourmr.com">sales@asfourmr.com</a>
              </div>
            </div>
            <div className="contact-detail">
              <Mail size={22} aria-hidden="true" />
              <div>
                <h3>European sales</h3>
                <a href="mailto:sales.europe@asfourmr.com">sales.europe@asfourmr.com</a>
              </div>
            </div>
            <div className="contact-detail">
              <Phone size={22} aria-hidden="true" />
              <div>
                <h3>Call our team</h3>
                <a href="tel:+201062014222">+20 106 201 4222</a>
              </div>
            </div>
            <div className="contact-detail">
              <MapPin size={22} aria-hidden="true" />
              <div>
                <h3>Find us in Egypt</h3>
                <p>Kornaish El Nile, Al Tibbeen<br />Helwan, Egypt · P.O. Box 47</p>
                <a
                  className="text-link"
                  href="https://www.google.com/maps/search/?api=1&query=Asfour%20Mining%20and%20Refractories%20Al%20Tibbeen%20Helwan%20Egypt"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Google Maps <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">TELL US WHAT YOU NEED</p>
            <ContactForm key={`${prefill.type}:${prefill.productSlug}:${prefill.topic}`} type={prefill.type} productSlug={prefill.productSlug} initialTopic={prefill.topic} />
          </div>
        </div>
      </section>
    </>
  );
}
