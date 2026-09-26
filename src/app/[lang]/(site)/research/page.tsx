import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { ContactBanner } from "@/components/site-footer";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { getSettings } from "@/lib/content";

export async function generateMetadata({ params }: PageProps<"/[lang]/research">): Promise<Metadata> {
  const { t } = await getLocale(params);
  return { title: t.research.title, description: t.research.description };
}

export default async function ResearchPage({ params }: PageProps<"/[lang]/research">) {
  const { lang, t } = await getLocale(params);
  const r = t.research;
  const { images } = await getSettings(lang);
  const contact = (topic: string) => localePath(lang, `/contact?${new URLSearchParams({ type: "technical", topic })}`);
  return <>
    <PageIntro lang={lang} eyebrow={r.eyebrow} title={r.heading} description={r.intro} />
    <section className="section-pad">
      <div className="container content-grid">
        <div className="editorial-image" data-wipe=""><Image src={images.research} alt={r.imageAlt} fill sizes="(max-width: 800px) 100vw, 50vw" style={{ objectFit: "cover" }} /></div>
        <div className="editorial-copy" data-reveal="end">
          <p className="eyebrow">{r.s1Eyebrow}</p>
          <h2>{r.s1Title[0]}<br />{r.s1Title[1]}</h2>
          {r.s1.map(p => <p key={p}>{p}</p>)}
          <Link href={contact(r.s1Topic)} className="text-link">{r.s1Link} <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
    <section className="section-pad">
      <div className="container content-grid">
        <div className="editorial-copy" data-reveal="start">
          <p className="eyebrow">{r.s2Eyebrow}</p>
          <h2>{r.s2Title[0]}<br />{r.s2Title[1]}</h2>
          <p>{r.s2Intro}</p>
          <ul className="simple-list" data-stagger="">{r.s2List.map(item => <li key={item}>{item}</li>)}</ul>
          <Link href={contact(r.s2Topic)} className="button button-blue">{r.s2Link} <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="editorial-image" data-wipe=""><Image src={images.laboratory} alt={r.labAlt} fill sizes="(max-width: 800px) 100vw, 50vw" style={{ objectFit: "cover" }} /></div>
      </div>
    </section>
    <ContactBanner lang={lang} />
  </>;
}
