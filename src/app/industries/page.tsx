import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { IndustryIcon } from "@/components/industry-icon";
import { ContactBanner } from "@/components/site-footer";
import { industries } from "@/lib/data";
export const metadata: Metadata={title:"Industries we serve"};
export default function IndustriesPage(){return <><PageIntro eyebrow="Industries we serve" title="Your industry. Our expertise." description="Every operation brings a different set of demands. We work with you to understand the process and identify a suitable refractory solution."/><section className="section-pad"><div className="container industry-list">{industries.map(i=><article id={i.slug} className="industry-detail" key={i.slug}><IndustryIcon type={i.icon}/><h2>{i.name}</h2><p>{i.text}</p><Link className="text-link" href={`/contact?product=${encodeURIComponent(i.name+" industry enquiry")}`}>Discuss your application <ArrowUpRight size={18}/></Link></article>)}</div></section><section className="pale-section section-pad"><div className="container content-grid"><div className="editorial-copy"><p className="eyebrow">BEYOND THE PRODUCT</p><h2>EXPERTISE THAT<br />FOLLOWS THROUGH.</h2><p>Our installation services support the operational process of refractory material installation. Talk to us about the scope of your project and the support your team needs.</p><Link href="/contact?product=Installation%20services" className="button button-blue">Discuss installation <ArrowUpRight size={18}/></Link></div><div className="editorial-image"><Image src="/images/kiln.jpg" alt="Industrial equipment at the Asfour facility" fill sizes="(max-width:600px) 100vw, 50vw"/></div></div></section><ContactBanner/></>;}
