import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export function NotFoundContent({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).notFound;
  return <section className="not-found"><h1>404</h1><h2>{t.title}</h2><p>{t.text}</p><Link className="button button-blue" href={localePath(lang, "/products")}>{t.link} <ArrowRight size={18} /></Link></section>;
}
