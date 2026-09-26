import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { ContactBanner } from "@/components/site-footer";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/careers">): Promise<Metadata> {
  const { t } = await getLocale(params);
  return { title: t.careers.title, description: t.careers.description };
}

export default async function CareersPage({ params }: PageProps<"/[lang]/careers">) {
  const { lang, t } = await getLocale(params);
  const c = t.careers;
  return <>
    <PageIntro lang={lang} eyebrow={c.eyebrow} title={c.heading} description={c.intro} />
    <section className="section-pad">
      <div className="container content-grid">
        <div className="editorial-copy" data-reveal="start">
          <p className="eyebrow">{c.s1Eyebrow}</p>
          <h2>{c.s1Title[0]}<br />{c.s1Title[1]}</h2>
          {c.s1.map(p => <p key={p}>{p}</p>)}
          <Link href={localePath(lang, "/contact?type=career")} className="button button-blue">{c.s1Link} <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="prose" data-reveal="end">
          <p className="eyebrow">{c.s2Eyebrow}</p>
          <h2>{c.s2Title[0]}<br />{c.s2Title[1]}</h2>
          <p>{c.s2Intro}</p>
          <ul className="simple-list" data-stagger="">{c.s2List.map(item => <li key={item}>{item}</li>)}</ul>
          <p>{c.s2Outro}</p>
        </div>
      </div>
    </section>
    <ContactBanner lang={lang} />
  </>;
}
