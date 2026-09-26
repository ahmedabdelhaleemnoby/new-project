import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { ContactBanner } from "@/components/site-footer";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { t } = await getLocale(params);
  return { title: t.about.title };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang, t } = await getLocale(params);
  const a = t.about;
  return <>
    <PageIntro lang={lang} eyebrow={a.eyebrow} title={a.heading} description={a.description} />
    <section className="section-pad"><div className="container"><div className="content-grid"><div className="editorial-image" data-wipe=""><Image src="/images/factory.jpg" alt={a.imageAlt} fill sizes="(max-width:600px) 100vw, 50vw" /></div><div className="editorial-copy" data-reveal="end"><p className="eyebrow">{a.storyEyebrow}</p><h2>{a.storyTitle[0]}<br /><span className="text-blue">{a.storyTitle[1]}</span></h2>{a.story.map(p => <p key={p}>{p}</p>)}<Link href={localePath(lang, "/products")} className="text-link">{a.storyLink} <ArrowUpRight size={18} /></Link></div></div></div></section>
    <section className="pale-section section-pad"><div className="container content-grid"><div className="editorial-copy" data-reveal="start"><p className="eyebrow">{a.commitmentEyebrow}</p><h2>{a.commitmentTitle[0]}<br />{a.commitmentTitle[1]}</h2></div><div className="editorial-copy" data-reveal="end">{a.commitment.map(p => <p key={p}>{p}</p>)}<Link className="button button-blue" href={localePath(lang, "/contact")}>{a.commitmentLink} <ArrowUpRight size={18} /></Link></div></div></section>
    <ContactBanner lang={lang} />
  </>;
}
