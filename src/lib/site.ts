// Company details shown across the site. Values marked TODO are placeholders until Ajyad's details are confirmed.
export const site = {
  name: { en: "Ajyad", ar: "أجياد" },
  fullName: { en: "Ajyad Thermotech", ar: "أجياد ثيرموتك" },
  /** Main contact address, used for sales enquiries and email fallbacks across the site. */
  salesEmail: "info@ajyad.online",
  /** TODO: optional second sales address (for example a regional team); null hides it. */
  secondaryEmail: null as { email: string; label: { en: string; ar: string } } | null,
  /** TODO: international format, e.g. "+20 100 000 0000"; null hides it. */
  phone: null as string | null,
  /** Street address lines per language and a map link; null hides the location block. */
  address: {
    en: ["Arab Abu Saad Industrial Zone, 670", "Giza, Egypt"],
    ar: ["المنطقة الصناعية بعرب أبو ساعد، 670", "الجيزة، مصر"],
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Arab%20Abu%20Saad%20Industrial%20Zone%2C%20Giza%2C%20Egypt",
  } as { en: string[]; ar: string[]; mapUrl: string } | null,
  /** Legal registration shown in the footer and on the contact page (from the company's tax card). */
  legal: {
    form: { en: "Limited liability company", ar: "شركة ذات مسؤولية محدودة" },
    commercialRegister: "295803",
    taxCard: "774-139-552",
  },
};
