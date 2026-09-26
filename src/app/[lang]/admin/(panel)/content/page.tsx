import type { Metadata } from "next";
import { flattenDictionary, getDictionary, getLocale } from "@/i18n/dictionaries";
import { adminLoad } from "@/lib/admin-load";
import { ContentEditor } from "@/components/admin/cms/content-editor";
import { NotReady } from "@/components/admin/cms/not-ready";
import { PageHead } from "@/components/admin/cms/page-head";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/content">): Promise<Metadata> {
  return { title: (await getLocale(params)).t.cms.content.title };
}

export default async function ContentAdmin({ params }: PageProps<"/[lang]/admin/content">) {
  const { lang, t } = await getLocale(params);
  const c = t.cms;
  const result = await adminLoad<{ en?: Record<string, string>; ar?: Record<string, string> }>(lang, "/admin/content");
  const defaults = { en: flattenDictionary(getDictionary("en")), ar: flattenDictionary(getDictionary("ar")) };
  return <>
    <PageHead eyebrow={c.nav.content} title={c.content.title} />
    <p className="cms-intro">{c.content.intro}</p>
    {"notReady" in result ? <NotReady t={c} endpoint="GET /admin/content" section="§3.3" />
      : "error" in result ? <div className="form-error" role="alert"><p>{result.error}</p></div>
      : <ContentEditor lang={lang} t={c} defaults={defaults} overrides={{ en: result.data.en ?? {}, ar: result.data.ar ?? {} }} />}
  </>;
}
