import type { Locale } from "@/i18n/config";
import { CATALOGUE_PDF } from "@/lib/data";
import { site } from "@/lib/site";

// Company details and page photos, resolved for one locale. The content API (`GET /settings`) can
// override any of these from the dashboard; src/lib/site.ts and the files below are the defaults.
export const imageKeys = ["hero_1", "hero_2", "hero_3", "about", "research", "laboratory", "installation", "preview_shaped", "preview_unshaped"] as const;
export type ImageKey = (typeof imageKeys)[number];

// Photos taken from the Ajyad catalogue (public/images/catalogue); replaceable from the dashboard's company settings.
export const defaultImages: Record<ImageKey, string> = {
  hero_1: "/images/catalogue/molten-pour.jpg",
  hero_2: "/images/catalogue/blast-furnace.jpg",
  hero_3: "/images/catalogue/furnace-slag.jpg",
  about: "/images/catalogue/ladle-glow.jpg",
  research: "/images/catalogue/olivine-rock.jpg",
  laboratory: "/images/catalogue/silica-ramming.jpg",
  installation: "/images/catalogue/preshaped-install.jpg",
  preview_shaped: "/images/catalogue/preshaped.jpg",
  preview_unshaped: "/images/catalogue/backfill.jpg",
};

export type SiteSettings = {
  name: string;
  fullName: string;
  email: string;
  secondaryEmail: { email: string; label: string } | null;
  phones: string[];
  whatsappPhone: string | null;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  /** The downloadable product catalogue (PDF). */
  catalogueUrl: string;
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
    phones: site.phones,
    whatsappPhone: site.whatsappPhone ?? null,
    linkedinUrl: site.linkedinUrl ?? null,
    facebookUrl: site.facebookUrl ?? null,
    catalogueUrl: CATALOGUE_PDF,
    address: site.address ? { lines: site.address[lang], mapUrl: site.address.mapUrl } : null,
    legal: { form: site.legal.form[lang], commercialRegister: site.legal.commercialRegister, taxCard: site.legal.taxCard },
    images: { ...defaultImages },
  };
}
