import type { Metadata } from "next";
import { getLocale } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: LayoutProps<"/[lang]/admin">): Promise<Metadata> {
  const { t } = await getLocale(params);
  return { title: { default: t.admin.enquiries, template: t.admin.titleTemplate }, robots: { index: false, follow: false } };
}

export default function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  return <div className="admin">{children}</div>;
}
