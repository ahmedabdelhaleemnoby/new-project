import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function ContactBanner() {
  return <section className="contact-banner"><div className="container contact-banner-inner"><div><span className="eyebrow">YOUR NEXT CHALLENGE. OUR SHARED AMBITION.</span><h2>LET’S BUILD SOMETHING<br />THAT LASTS.</h2></div><Link href="/contact" className="button button-light">Talk to our team <ArrowUpRight size={19} /></Link></div></section>;
}
export function SiteFooter() {
  return <footer className="site-footer"><div className="container"><div className="footer-main"><div className="footer-brand"><Link href="/" className="footer-wordmark">ASFOUR<span> M&R</span></Link><p>Refractory expertise.<br />Made in Egypt. Trusted worldwide.</p></div><div><h3>Explore</h3><Link href="/about">About Asfour</Link><Link href="/products">Our products</Link><Link href="/industries">Sectors we serve</Link><Link href="/research">Research & development</Link><Link href="/careers">Careers</Link></div><div><h3>Get in touch</h3><a href="mailto:sales@asfourmr.com">sales@asfourmr.com <ArrowUpRight size={14} /></a><a href="tel:+201062014222">+20 106 201 4222</a><p>Kornaish El Nile, Al Tibbeen<br />Helwan, Egypt · P.O. Box 47</p></div><div className="footer-note"><span className="eyebrow">FROM OUR HOME TO YOURS</span><p>Egyptian expertise.<br />A global perspective.</p><Link href="/contact">Find your solution <ArrowUpRight size={18} /></Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Asfour M&R. All rights reserved.</span><span>MINING. MATERIALS. POSSIBILITIES.</span><a href="#top">Back to top ↑</a></div></div></footer>;
}
