import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { localePath, type Locale } from "@/i18n/config";
import { getSiteDictionary } from "@/i18n/dictionaries";

export async function NotFoundContent({ lang }: { lang: Locale }) {
  const t = (await getSiteDictionary(lang)).notFound;
  return <section className="not-found"><h1>404</h1><h2>{t.title}</h2><p>{t.text}</p><Link className="button button-blue" href={localePath(lang, "/products")}>{t.link} <ArrowRight size={18} /></Link></section>;
}
