import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/logo";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { adminBrandName, getToken } from "@/lib/admin-api";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/login">): Promise<Metadata> {
  const { t } = await getLocale(params);
  return { title: t.admin.signInTitle };
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[lang]/admin/login">) {
  const { lang, t } = await getLocale(params);
  const [{ expired, next }, token] = await Promise.all([searchParams, getToken()]);
  if (token && !expired) redirect(localePath(lang, "/admin"));
  return <main className="admin-login">
    <div className="admin-login-card">
      <Logo alt={adminBrandName(lang)} className="admin-login-logo" />
      <p className="eyebrow"><span className="small-square" />{t.admin.staffArea}</p>
      <h1>{t.admin.signIn}</h1>
      {expired && <p className="admin-notice" role="status">{t.admin.expired}</p>}
      <LoginForm lang={lang} t={t.admin} next={typeof next === "string" ? next : ""} />
    </div>
  </main>;
}
