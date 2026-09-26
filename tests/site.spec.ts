import { expect, test } from "@playwright/test";

test("home navigation, highlight controls, and category preview", async ({ page, isMobile }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("BUILT FORTHE EXTREME.");
  await page.getByRole("button", { name: "Next highlight" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("PRECISION INEVERY PRODUCT.");
  await page.getByRole("button", { name: "Previous highlight" }).click();
  await page.getByRole("button", { name: "Unshaped products" }).click();
  await expect(page.locator(".product-rows").getByRole("link", { name: /Refractory castables/ })).toBeVisible();
  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Products", exact: true }).click();
    await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  } else {
    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Products", exact: true }).click();
  }
  await expect(page).toHaveURL(/\/products$/);
  expect(errors).toEqual([]);
});

test("catalogue filters, grade search, empty state, and product enquiry", async ({ page }) => {
  await page.goto("/products?category=Unshaped");
  await expect(page.getByRole("status")).toHaveText("4 product families");
  await page.getByRole("button", { name: "All products", exact: true }).click();
  await page.getByRole("textbox", { name: "Search products or grades" }).fill("BLW2301");
  await expect(page.getByRole("status")).toHaveText("1 product family");
  await page.getByRole("link", { name: /Lightweight bricks/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lightweight bricks");
  await expect(page.getByRole("link", { name: /BLW2301 technical datasheet/ })).toHaveAttribute("href", /BLW2301\.pdf$/);
  await page.getByRole("link", { name: "Enquire about this product" }).click();
  await expect(page.getByRole("textbox", { name: /Product of interest/ })).toHaveValue("Lightweight bricks");
  await page.goto("/products");
  await page.getByRole("textbox", { name: "Search products or grades" }).fill("nonexistent-grade-xyz");
  await expect(page.getByRole("heading", { name: "No matching products" })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("status")).toHaveText("9 product families");
});

test("enquiry prepares an encoded draft and invalidates it on edits", async ({ page }) => {
  await page.goto("/contact?product=Refractory%20castables");
  await page.getByRole("button", { name: "Prepare enquiry" }).click();
  await expect(page.getByRole("link", { name: "Open email draft" })).toHaveCount(0);
  await page.getByRole("textbox", { name: "Full name" }).fill("Test Buyer");
  await page.getByRole("textbox", { name: "Company", exact: true }).fill("Example Industries");
  await page.getByRole("textbox", { name: "Work email" }).fill("buyer@example.com");
  await page.getByRole("textbox", { name: "How can we help?" }).fill("Please advise on castables for our kiln & installation.");
  await page.getByRole("button", { name: "Prepare enquiry" }).click();
  await expect(page.getByText("Your enquiry is ready. Open your email app to send it.")).toBeVisible();
  const href = await page.getByRole("link", { name: "Open email draft" }).getAttribute("href");
  expect(href).toContain("mailto:sales@asfourmr.com?");
  expect(decodeURIComponent(href!)).toContain("kiln & installation.");
  expect(decodeURIComponent(href!)).toContain("Product of interest: Refractory castables");
  await page.getByRole("textbox", { name: "How can we help?" }).fill("Updated requirements");
  await expect(page.getByRole("link", { name: "Open email draft" })).toHaveCount(0);
});

test("pages render without overflow and missing products return 404", async ({ page }) => {
  for (const route of ["/", "/about", "/products", "/industries", "/research", "/contact", "/careers"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${route} has horizontal overflow`).toBe(true);
  }
  const response = await page.goto("/products/not-a-product");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "THIS PAGE IS OUT OF RANGE." })).toBeVisible();
});
