import { expect, test, type Page } from "@playwright/test";

// The first-visit intro plays once per session; skip it except in the tests that cover it.
test.beforeEach(async ({ page }, info) => {
  if (!info.title.includes("intro")) await page.addInitScript(() => sessionStorage.setItem("ajyad-intro", "1"));
});

test("first-visit intro plays once per session and can be skipped", async ({ page }) => {
  await page.goto("/");
  const intro = page.locator(".intro");
  await expect(intro).toBeVisible();
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(intro).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.reload();
  await expect(page.locator(".intro")).toHaveCount(0);
});

test("intro is not shown with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ar");
  await expect(page.locator(".intro")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

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

test("catalogue filters, search, empty state, and product enquiry", async ({ page }) => {
  await page.goto("/products?category=Unshaped");
  await expect(page.getByRole("status")).toHaveText("4 product families");
  await page.getByRole("button", { name: "All products", exact: true }).click();
  await page.getByRole("textbox", { name: "Search products" }).fill("lightweight");
  await expect(page.getByRole("status")).toHaveText("1 product family");
  await page.getByRole("link", { name: /Lightweight bricks/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lightweight bricks");
  await page.getByRole("link", { name: "Enquire about this product" }).click();
  await expect(page.getByRole("textbox", { name: /Product of interest/ })).toHaveValue("Lightweight bricks");
  await page.goto("/products");
  await page.getByRole("textbox", { name: "Search products" }).fill("nonexistent-product-xyz");
  await expect(page.getByRole("heading", { name: "No matching products" })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("status")).toHaveText("9 product families");
});

test("Arabic pages render right-to-left and the language switch keeps the page", async ({ page, isMobile }) => {
  await page.goto("/products");
  const toArabic = page.getByRole("link", { name: "عرض الموقع باللغة العربية" }).first();
  await toArabic.click();
  await expect(page).toHaveURL(/\/ar\/products$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("مواد صُنعت للتحدي.");
  await expect(page.getByRole("status")).toHaveText("9 مجموعات منتجات");
  await page.getByRole("link", { name: /الخرسانات الحرارية/ }).first().click();
  await expect(page).toHaveURL(/\/ar\/products\/castables$/);
  if (!isMobile) await page.getByRole("link", { name: "View this page in English" }).first().click();
  else await page.goto("/ar/products/castables".replace("/ar", ""));
  await expect(page).toHaveURL(/\/products\/castables$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  const response = await page.goto("/en/about");
  expect(response?.url()).toMatch(/\/about$/);
});

const API = "https://project2.gfoura.com/api/v1/enquiries";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, accept, idempotency-key", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Expose-Headers": "Retry-After" };

async function fillEnquiry(page: Page, message = "Please advise on castables for our kiln & installation.") {
  await page.getByRole("textbox", { name: "Full name" }).fill("Test Buyer");
  await page.getByRole("textbox", { name: "Company", exact: true }).fill("Example Industries");
  await page.getByRole("textbox", { name: "Work email" }).fill("buyer@example.com");
  await page.getByRole("textbox", { name: "How can we help?" }).fill(message);
}

test("enquiry submits to the API, retries with the same key, and shows the reference", async ({ page }) => {
  const requests: { body: Record<string, unknown>; key: string | null }[] = [];
  let attempt = 0;
  await page.route(API, async route => {
    const request = route.request();
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    requests.push({ body: request.postDataJSON(), key: request.headers()["idempotency-key"] ?? null });
    attempt += 1;
    if (attempt === 1) return route.fulfill({ status: 503, headers: cors, json: { error: { code: "SERVICE_UNAVAILABLE", message: "Your enquiry could not be saved. Please try again shortly." } } });
    return route.fulfill({ status: 201, headers: cors, json: { reference: "ENQ-TEST123", status: "received" } });
  });

  await page.goto("/contact?product=castables");
  await expect(page.getByRole("textbox", { name: /Product of interest/ })).toHaveValue("Refractory castables");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  expect(requests).toHaveLength(0);
  await fillEnquiry(page);
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.locator(".inquiry-form").getByRole("alert")).toContainText("could not be sent");
  await expect(page.getByRole("textbox", { name: "How can we help?" })).toHaveValue("Please advise on castables for our kiln & installation.");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.getByText("ENQ-TEST123")).toBeVisible();

  expect(requests).toHaveLength(2);
  expect(requests[0].key).toMatch(/^[0-9a-f-]{36}$/);
  expect(requests[1].key).toBe(requests[0].key);
  expect(requests[0].body).toEqual({ type: "sales", name: "Test Buyer", email: "buyer@example.com", company: "Example Industries", phone: null, productSlug: "castables", topic: "Refractory castables", message: "Please advise on castables for our kiln & installation.", website: null });
});

test("enquiry shows field errors from the API and routes career enquiries", async ({ page }) => {
  const bodies: Record<string, unknown>[] = [];
  await page.route(API, async route => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    bodies.push(route.request().postDataJSON());
    return route.fulfill({ status: 422, headers: cors, json: { message: "The email field must be a valid email address.", errors: { email: ["The email field must be a valid email address."] } } });
  });

  await page.goto("/careers");
  await page.getByRole("link", { name: "Introduce yourself" }).click();
  await expect(page).toHaveURL(/type=career/);
  await page.getByRole("textbox", { name: "Full name" }).fill("Test Applicant");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("applicant@example.com");
  await page.getByRole("textbox", { name: "How can we help?" }).fill("Engineering experience.");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.locator(".inquiry-form").getByRole("alert")).toHaveText("Check the highlighted fields.");
  await expect(page.getByRole("textbox", { name: "Email", exact: true })).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("The email field must be a valid email address.")).toBeVisible();
  expect(bodies[0]).toMatchObject({ type: "career", company: null, productSlug: null });
});

test("pages render without overflow and missing products return 404", async ({ page }) => {
  for (const route of ["/", "/about", "/products", "/industries", "/research", "/contact", "/careers", "/ar", "/ar/about", "/ar/products", "/ar/industries", "/ar/research", "/ar/contact", "/ar/careers"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${route} has horizontal overflow`).toBe(true);
  }
  const response = await page.goto("/products/not-a-product");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "THIS PAGE IS OUT OF RANGE." })).toBeVisible();
});

test("unknown URLs keep the site navigation and the admin area requires sign-in", async ({ page }) => {
  const response = await page.goto("/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "THIS PAGE IS OUT OF RANGE." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ajyad home" })).toBeVisible();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toHaveCount(0);
});

test("dashboard content sections require sign-in", async ({ page }) => {
  for (const route of ["/admin/products", "/admin/sectors", "/admin/content", "/admin/media", "/admin/settings", "/admin/staff", "/ar/admin/products"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin\/login$/);
  }
});
