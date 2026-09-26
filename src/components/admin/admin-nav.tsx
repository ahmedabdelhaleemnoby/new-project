"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Building2, FileText, Image as ImageIcon, Inbox, Layers, Package, Users } from "lucide-react";
import { localePath, stripLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

const items = [
  { key: "enquiries", path: "/admin", icon: Inbox },
  { key: "products", path: "/admin/products", icon: Package },
  { key: "sectors", path: "/admin/sectors", icon: Layers },
  { key: "content", path: "/admin/content", icon: FileText },
  { key: "media", path: "/admin/media", icon: ImageIcon },
  { key: "settings", path: "/admin/settings", icon: Building2 },
  { key: "staff", path: "/admin/staff", icon: Users },
] as const;

export function AdminNav({ lang, t, sections }: { lang: Locale; t: Dictionary["cms"]["nav"]; sections: string[] }) {
  const path = stripLocale(usePathname());
  const active = (itemPath: string) => (itemPath === "/admin" ? path === "/admin" || path.startsWith("/admin/enquiries") : path.startsWith(itemPath));
  return <nav className="admin-nav" aria-label="Dashboard">
    {items.filter(item => sections.includes(item.key)).map(({ key, path: itemPath, icon: Icon }) => <Link key={key} href={localePath(lang, itemPath)} className={active(itemPath) ? "active" : ""} aria-current={active(itemPath) ? "page" : undefined}><Icon size={17} aria-hidden="true" />{t[key]}</Link>)}
    <a href={localePath(lang, "/")} target="_blank" rel="noopener" className="admin-nav-site"><ArrowUpRight size={17} aria-hidden="true" />{t.viewSite}</a>
  </nav>;
}
