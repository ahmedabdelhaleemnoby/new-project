import { expect, test } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SocialContactLinks } from "../src/components/social-contact-links";
import { linkedinHref, whatsappHref } from "../src/lib/contact-links";
import { en } from "../src/i18n/dictionaries/en";
import { ar } from "../src/i18n/dictionaries/ar";

// Reserved example number and sample company URL: fixture data never goes into site settings.
const configured = { whatsappPhone: "+1 (202) 555-0123", linkedinUrl: "https://www.linkedin.com/company/example-company/" };

for (const [lang, t] of [["en", en.contactLinks], ["ar", ar.contactLinks]] as const) {
  test(`configured contact channels render safe destinations in ${lang}`, async ({ page }) => {
    const html = renderToStaticMarkup(createElement(SocialContactLinks, { settings: configured, t }));
    await page.setContent(`<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}"><body>${html}</body></html>`);
    const whatsapp = page.getByRole("link", { name: t.whatsappLabel });
    const linkedin = page.getByRole("link", { name: t.linkedinLabel });
    await expect(whatsapp).toBeVisible();
    await expect(whatsapp).toHaveAttribute("href", "https://wa.me/12025550123");
    await expect(linkedin).toBeVisible();
    await expect(linkedin).toHaveAttribute("href", configured.linkedinUrl);
    for (const link of [whatsapp, linkedin]) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
}

test("missing or invalid channel settings do not produce misleading links", async ({ page }) => {
  for (const settings of [
    { whatsappPhone: null, linkedinUrl: null },
    { whatsappPhone: "invalid", linkedinUrl: "javascript:alert(1)" },
  ]) {
    await page.setContent(renderToStaticMarkup(createElement(SocialContactLinks, { settings, t: en.contactLinks, detailed: true })));
    await expect(page.getByRole("link")).toHaveCount(0);
  }
  expect(whatsappHref("+1 (202) 555-0123")).toBe("https://wa.me/12025550123");
  expect(whatsappHref("02025550123")).toBeNull();
  expect(linkedinHref("https://linkedin.com.evil.example/company/test")).toBeNull();
  expect(linkedinHref("https://linkedin.com@evil.example/company/test")).toBeNull();
});
