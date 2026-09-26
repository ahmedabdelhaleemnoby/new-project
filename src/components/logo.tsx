import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { site } from "@/lib/site";

// Rendered from the supplied AJYAD LOOG.eps (black artwork), coloured to match the brand mockup.
export function Logo({ lang, className = "", priority = false }: { lang: Locale; className?: string; priority?: boolean }) {
  return <Image src="/images/ajyad-logo.png" alt={site.fullName[lang]} width={2400} height={737} className={`logo ${className}`} sizes="220px" priority={priority} />;
}
