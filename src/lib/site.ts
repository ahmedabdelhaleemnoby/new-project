// Company details shown across the site. Values marked TODO are placeholders until Ajyad's details are confirmed.
export const site = {
  name: { en: "Ajyad", ar: "أجياد" },
  fullName: { en: "Ajyad Thermotech", ar: "أجياد ثيرموتك" },
  /** TODO: replace with Ajyad's sales address. `.example` is a reserved domain, so this never delivers mail. */
  salesEmail: "sales@ajyad.example",
  /** TODO: optional second sales address (for example a regional team); null hides it. */
  secondaryEmail: null as { email: string; label: { en: string; ar: string } } | null,
  /** TODO: international format, e.g. "+20 100 000 0000"; null hides it. */
  phone: null as string | null,
  /** TODO: street address lines per language and a map link; null hides the location block. */
  address: null as { en: string[]; ar: string[]; mapUrl: string } | null,
};
