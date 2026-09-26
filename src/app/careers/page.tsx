import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "../../components/page-intro";
import { ContactBanner } from "../../components/site-footer";

export const metadata: Metadata = {
  title: "Careers",
  description: "Introduce yourself to Asfour M&R and express your interest in future career opportunities.",
};

export default function CareersPage() {
  return (
    <>
      <PageIntro
        eyebrow="Careers"
        title="YOUR NEXT CHAPTER."
        description="Bring your experience, your curiosity, and your interest in the materials that shape industry. Start a conversation about a future with Asfour M&R."
      />
      <section className="section-pad">
        <div className="container content-grid">
          <div className="editorial-copy">
            <p className="eyebrow">LET’S GET TO KNOW YOU</p>
            <h2>Great work begins<br />with people.</h2>
            <p>Interested in joining Asfour M&R? We welcome introductions from people who would like to contribute their skills and experience to our business.</p>
            <p>There are no specific vacancies listed on this page. You can still make a speculative enquiry about future opportunities.</p>
            <Link href="/contact?product=Career%20enquiry" className="button button-blue">
              Introduce yourself <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="prose">
            <p className="eyebrow">MAKE AN INTRODUCTION</p>
            <h2>Tell us where<br />you want to go.</h2>
            <p>A few details will help our team understand your interests. In your enquiry, tell us about:</p>
            <ul className="simple-list">
              <li>Your area of expertise and relevant experience.</li>
              <li>The kind of role or work you are interested in.</li>
              <li>Your contact details and location.</li>
            </ul>
            <p>The contact form prepares an email draft for you to review and send. You can attach your CV in your email app before sending it.</p>
          </div>
        </div>
      </section>
      <ContactBanner />
    </>
  );
}
