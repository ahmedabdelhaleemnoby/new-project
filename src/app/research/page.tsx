import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "../../components/page-intro";
import { ContactBanner } from "../../components/site-footer";

export const metadata: Metadata = {
  title: "Research & Development",
  description: "Discover Asfour M&R’s research and development facility, supporting product development to customer specifications.",
};

export default function ResearchPage() {
  return (
    <>
      <PageIntro
        eyebrow="Research & development"
        title="BUILT AROUND YOUR REQUIREMENTS."
        description="Our research and development facility supports a clear purpose: developing products to customer specifications."
      />
      <section className="section-pad">
        <div className="container content-grid">
          <div className="editorial-image">
            <Image
              src="/images/research.jpg"
              alt="Research and development at Asfour M&R"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="editorial-copy">
            <p className="eyebrow">FROM REQUIREMENT TO PRODUCT</p>
            <h2>A closer look.<br />A better starting point.</h2>
            <p>Every application begins with its own requirements. Our research and development facility helps us develop products to meet customer specifications.</p>
            <p>By sharing your technical needs with our team, you give us the starting point for a focused conversation about your product requirements.</p>
            <Link href="/contact?product=Technical%20enquiry" className="text-link">
              Discuss your requirements <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <section className="section-pad">
        <div className="container content-grid">
          <div className="editorial-copy">
            <p className="eyebrow">START WITH THE DETAILS</p>
            <h2>Your specifications.<br />Our shared focus.</h2>
            <p>Help us understand what your application needs. When you contact our team, useful details include:</p>
            <ul className="simple-list">
              <li>The product and its intended application.</li>
              <li>Your operating conditions and performance requirements.</li>
              <li>Any technical specifications you can share.</li>
            </ul>
            <Link href="/contact?product=Research%20and%20development%20enquiry" className="button button-blue">
              Start a technical conversation <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="editorial-image">
            <Image
              src="/images/laboratory.jpg"
              alt="Laboratory facilities at Asfour M&R"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>
      <ContactBanner />
    </>
  );
}
