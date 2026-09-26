import type { Metadata } from "next";
import { getLocale } from "@/i18n/dictionaries";
import { adminLoad } from "@/lib/admin-load";
import type { AdminSettings } from "@/lib/admin-shared";
import { NotReady } from "@/components/admin/cms/not-ready";
import { PageHead } from "@/components/admin/cms/page-head";
import { SettingsForm } from "@/components/admin/cms/settings-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/settings">): Promise<Metadata> {
  return { title: (await getLocale(params)).t.cms.settings.title };
}

export default async function SettingsAdmin({ params }: PageProps<"/[lang]/admin/settings">) {
  const { lang, t } = await getLocale(params);
  const result = await adminLoad<AdminSettings>(lang, "/admin/settings");
  return <>
    <PageHead eyebrow={t.cms.nav.settings} title={t.cms.settings.title} />
    {"notReady" in result ? <NotReady t={t.cms} endpoint="GET /admin/settings" section="§3.4" />
      : "error" in result ? <div className="form-error" role="alert"><p>{result.error}</p></div>
      : <SettingsForm lang={lang} t={t.cms} settings={{ ...result.data, images: result.data.images ?? {} }} />}
  </>;
}
