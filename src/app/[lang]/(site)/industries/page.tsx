import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { IndustryIcon } from "@/components/industry-icon";
import { ContactBanner } from "@/components/site-footer";
import { fill, localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { getIndustries } from "@/lib/content";

export async function generateMetadata({ params }: PageProps<"/[lang]/industries">): Promise<Metadata> {
  const { t } = await getLocale(params);
  return { title: t.sectorsPage.title };
}

export default async function IndustriesPage({ params }: PageProps<"/[lang]/industries">) {
  const { lang, t } = await getLocale(params);
  const s = t.sectorsPage;
  const industries = await getIndustries(lang);
  const contact = (query: Record<string, string>) => localePath(lang, `/contact?${new URLSearchParams(query)}`);
  return <>
    <PageIntro lang={lang} eyebrow={s.eyebrow} title={s.heading} description={s.description} />
    <section className="section-pad"><div className="container industry-list" data-stagger="">{industries.map(i => <article id={i.slug} className="industry-detail" key={i.slug}><IndustryIcon type={i.icon} /><h2>{i.name}</h2><p>{i.text}</p><Link className="text-link" href={contact({ topic: fill(s.topic, { name: i.name }) })}>{s.discuss} <ArrowUpRight size={18} /></Link></article>)}</div></section>
    <section className="pale-section section-pad"><div className="container content-grid"><div className="editorial-copy" data-reveal="start"><p className="eyebrow">{s.installEyebrow}</p><h2>{s.installTitle[0]}<br />{s.installTitle[1]}</h2><p>{s.installText}</p><Link href={contact({ type: "technical", topic: s.installTopic })} className="button button-blue">{s.installLink} <ArrowUpRight size={18} /></Link></div><div className="editorial-image" data-wipe=""><Image src="/images/kiln.jpg" alt={s.installImageAlt} fill sizes="(max-width:600px) 100vw, 50vw" /></div></div></section>
    <ContactBanner lang={lang} />
  </>;
}
