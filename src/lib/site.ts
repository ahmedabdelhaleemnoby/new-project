// Company details shown across the site.
export const site = {
  name: { en: "Ajyad", ar: "أجياد" },
  fullName: { en: "Ajyad Thermotech", ar: "أجياد ثيرموتك" },
  /** Main contact address, used for sales enquiries and email fallbacks across the site. */
  salesEmail: "sales@asfourmr.com",
  /** Secondary sales address */
  secondaryEmail: {
    email: "sales.europe@asfourmr.com",
    label: { en: "sales.europe@asfourmr.com", ar: "sales.europe@asfourmr.com" },
  } as { email: string; label: { en: string; ar: string } } | null,
  /** Phone numbers in international and local formats */
  phones: [
    "02- 25 444 674",
    "02- 25 444 696",
    "02- 25 444 053",
    "(+20) 0106 201 4222",
    "(+20) 0100 012 8047",
  ] as string[],
  /** Primary WhatsApp phone number for direct chat */
  whatsappPhone: "+201062014222",
  /** Social profiles */
  linkedinUrl: "https://www.linkedin.com/company/asfourmr",
  facebookUrl: "https://www.facebook.com/asfourmr",
  /** Street address lines per language and a map link */
  address: {
    en: ["Kornaish El Nile, Al Tibbeen, Helwan, Egypt.", "P.O.BOX 47 Helwan"],
    ar: ["كورنيش النيل، التبين، حلوان، مصر", "ص.ب 47 حلوان"],
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Kornaish+El+Nile+Al+Tibbeen+Helwan+Egypt",
  } as { en: string[]; ar: string[]; mapUrl: string } | null,
  /** Legal registration shown in the footer and on the contact page (from the company's tax card). */
  legal: {
    form: { en: "Limited liability company", ar: "شركة ذات مسؤولية محدودة" },
    commercialRegister: "295803",
    taxCard: "774-139-552",
  },
};

