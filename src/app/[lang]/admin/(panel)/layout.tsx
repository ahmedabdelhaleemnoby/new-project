import Link from "next/link";
import { Globe, LogOut } from "lucide-react";
import { logoutAction } from "@/app/[lang]/admin/actions";
import { Logo } from "@/components/logo";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { adminFetch, type Staff } from "@/lib/admin-api";

export default async function PanelLayout({ children, params }: LayoutProps<"/[lang]/admin">) {
  const { lang, t } = await getLocale(params);
  const { staff } = await adminFetch<{ staff: Staff }>(lang, "/admin/me");
  const otherLang = lang === "en" ? "ar" : "en";
  return <>
    <header className="admin-bar">
      <div className="admin-container admin-bar-inner">
        <Link href={localePath(lang, "/admin")} className="admin-brand"><Logo lang={lang} /><span>{t.admin.brand}</span></Link>
        <div className="admin-user">
          <Link href={localePath(otherLang, "/admin")} className="lang-switch" hrefLang={otherLang} lang={otherLang}><Globe size={15} aria-hidden="true" />{t.admin.switchLanguage}</Link>
          <span><strong>{staff.name}</strong><small>{staff.role}</small></span>
          <form action={logoutAction.bind(null, lang)}><button type="submit" className="button button-outline"><LogOut size={16} aria-hidden="true" /> {t.admin.signOut}</button></form>
        </div>
      </div>
    </header>
    <main className="admin-container admin-main">{children}</main>
  </>;
}
