import type { Metadata } from "next";
import { getLocale } from "@/i18n/dictionaries";
import { adminLoad } from "@/lib/admin-load";
import { MediaLibrary } from "@/components/admin/cms/media-library";
import { NotReady } from "@/components/admin/cms/not-ready";
import { PageHead } from "@/components/admin/cms/page-head";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/media">): Promise<Metadata> {
  return { title: (await getLocale(params)).t.cms.media.title };
}

export default async function MediaAdmin({ params }: PageProps<"/[lang]/admin/media">) {
  const { lang, t } = await getLocale(params);
  // Probe once on the server so a missing endpoint shows the same notice as other sections.
  const probe = await adminLoad<unknown[]>(lang, "/admin/media?page=1");
  return <>
    <PageHead eyebrow={t.cms.nav.media} title={t.cms.media.title} />
    {"notReady" in probe ? <NotReady t={t.cms} endpoint="GET /admin/media" section="§3.5" /> : <MediaLibrary lang={lang} t={t.cms} />}
  </>;
}
