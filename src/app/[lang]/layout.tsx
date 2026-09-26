import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import { dirOf, locales } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { RevealObserver } from "@/components/motion";
import "../globals.css";
import "../motion.css";

const manrope = localFont({ src: [{ path: "../../../public/fonts/manrope-400.ttf", weight: "400" }, { path: "../../../public/fonts/manrope-500.ttf", weight: "500" }, { path: "../../../public/fonts/manrope-600.ttf", weight: "600" }, { path: "../../../public/fonts/manrope-700.ttf", weight: "700" }], variable: "--font-manrope", display: "swap" });
const barlow = localFont({ src: [{ path: "../../../public/fonts/barlow-condensed-500.ttf", weight: "500" }, { path: "../../../public/fonts/barlow-condensed-600.ttf", weight: "600" }, { path: "../../../public/fonts/barlow-condensed-700.ttf", weight: "700" }], variable: "--font-barlow", display: "swap" });
// Arabic faces are only preloaded where they are used (see globals.css `html[lang=ar]`).
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600", "700"], variable: "--font-plex-arabic", display: "swap", preload: false });
const cairo = Cairo({ subsets: ["arabic"], weight: ["600", "700", "800"], variable: "--font-cairo", display: "swap", preload: false });

export function generateStaticParams() {
  return locales.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { t } = await getLocale(params);
  return { title: { default: t.meta.title, template: t.meta.titleTemplate }, description: t.meta.description, robots: { index: false, follow: false } };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await getLocale(params);
  // The inline script runs before first paint: it enables reveal styles (without JS nothing is hidden) and
  // hides the intro when it already played this session or the visitor prefers reduced motion.
  return <html lang={lang} dir={dirOf(lang)} className={`${manrope.variable} ${barlow.variable} ${plexArabic.variable} ${cairo.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "var d=document.documentElement,r=matchMedia('(prefers-reduced-motion: reduce)').matches,s;try{s=sessionStorage.getItem('ajyad-intro')}catch(e){s=1}if(r||s)d.classList.add('intro-seen');if(!r&&'IntersectionObserver'in window)d.classList.add('motion')" }} /></head><body id="top">{children}<RevealObserver /></body></html>;
}
