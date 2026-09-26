import Link from "next/link";
import { Globe, LogOut } from "lucide-react";
import { logoutAction } from "@/app/[lang]/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/logo";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { adminBrandName, adminFetch, roleSections, type Staff, type StaffRole } from "@/lib/admin-api";

export default async function PanelLayout({ children, params }: LayoutProps<"/[lang]/admin">) {
  const { lang, t } = await getLocale(params);
  const { staff } = await adminFetch<{ staff: Staff }>(lang, "/admin/me");
  const otherLang = lang === "en" ? "ar" : "en";
  // Unknown roles see every section; the backend still enforces permissions on each request.
  const sections = roleSections[staff.role as StaffRole] ?? roleSections.admin;
  const roleLabel = t.cms.staff.roles[staff.role as StaffRole] ?? staff.role;
  return <>
    <header className="admin-bar">
      <div className="admin-container admin-bar-inner">
        <Link href={localePath(lang, "/admin")} className="admin-brand"><Logo alt={adminBrandName(lang)} /><span>{t.admin.brand}</span></Link>
        <div className="admin-user">
          <Link href={localePath(otherLang, "/admin")} className="lang-switch" hrefLang={otherLang} lang={otherLang}><Globe size={15} aria-hidden="true" />{t.admin.switchLanguage}</Link>
          <span><strong>{staff.name}</strong><small>{roleLabel}</small></span>
          <form action={logoutAction.bind(null, lang)}><button type="submit" className="button button-outline"><LogOut size={16} aria-hidden="true" /> {t.admin.signOut}</button></form>
        </div>
      </div>
    </header>
    <div className="admin-container admin-shell">
      <AdminNav lang={lang} t={t.cms.nav} sections={sections} />
      <main className="admin-main">{children}</main>
    </div>
  </>;
}
