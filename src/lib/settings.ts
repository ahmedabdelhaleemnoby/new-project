import type { Locale } from "@/i18n/config";
import { site } from "@/lib/site";

// Company details and page photos, resolved for one locale. The content API (`GET /settings`) can
// override any of these from the dashboard; src/lib/site.ts and the files below are the defaults.
export const imageKeys = ["hero_1", "hero_2", "hero_3", "about", "research", "laboratory", "installation", "preview_shaped", "preview_unshaped"] as const;
export type ImageKey = (typeof imageKeys)[number];

// TODO: placeholder photos (see ASSET_SOURCES.md); replace them from the dashboard's company settings.
export const defaultImages: Record<ImageKey, string> = {
  hero_1: "/images/hero.jpg",
  hero_2: "/images/production.jpg",
  hero_3: "/images/about.jpg",
  about: "/images/factory.jpg",
  research: "/images/research.jpg",
  laboratory: "/images/laboratory.jpg",
  installation: "/images/kiln.jpg",
  preview_shaped: "/images/production.jpg",
  preview_unshaped: "/images/about.jpg",
};

export type SiteSettings = {
  name: string;
  fullName: string;
  email: string;
  secondaryEmail: { email: string; label: string } | null;
  phone: string | null;
  address: { lines: string[]; mapUrl: string } | null;
  legal: { form: string; commercialRegister: string; taxCard: string };
  images: Record<ImageKey, string>;
};

export function localSettings(lang: Locale): SiteSettings {
  return {
    name: site.name[lang],
    fullName: site.fullName[lang],
    email: site.salesEmail,
    secondaryEmail: site.secondaryEmail ? { email: site.secondaryEmail.email, label: site.secondaryEmail.label[lang] } : null,
    phone: site.phone,
    address: site.address ? { lines: site.address[lang], mapUrl: site.address.mapUrl } : null,
    legal: { form: site.legal.form[lang], commercialRegister: site.legal.commercialRegister, taxCard: site.legal.taxCard },
    images: { ...defaultImages },
  };
}
