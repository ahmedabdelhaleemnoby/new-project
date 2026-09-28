# Ajyad Thermotech — Next.js website

Bilingual (English/Arabic) industrial website for Ajyad Thermotech, built with Next.js 16, React 19, TypeScript, and the App Router. It started as a redesign of the Asfour M&R site and was rebranded; see "Placeholders before launch" below. Fonts are stored locally or self-hosted by `next/font`.

## Run locally

The active project is `/Users/ahmedabuzyad/Developer/asfour-next` (the folder keeps its original name). Use this copy for development. The earlier copy in `/Users/ahmedabuzyad/Documents/New project` may be iCloud-offloaded, which can stall file reads and development commands.

Requires Node.js 20.9 or newer. Install dependencies once with `npm install` if needed, then start the development server from the active project:

```bash
cd ~/Developer/asfour-next
npm run dev
```

Open http://localhost:3000. To use the preview port used during development:

```bash
npm run dev -- --port 3100
```

## Production and checks

```bash
npm run build
npm start
npm run typecheck
npm run test:e2e
```

The Playwright checks exercise desktop and mobile navigation, catalogue filters and search, product-to-enquiry handoff, form validation and email draft generation, route responses, and horizontal overflow. They currently use an installed Google Chrome through `channel: "chrome"`; install Chrome, or remove that setting and run `npx playwright install chromium` to use Playwright's bundled browser. Tests start a local server on port 3100 when needed.

## Pages

- `/` — homepage, manual highlight carousel, interactive product categories, industry overview.
- `/about` — company story and history.
- `/products` — searchable catalogue, shaped/unshaped filters, grade search.
- `/products/[slug]` — nine product families with enquiry links; verified external datasheets on lightweight and dense alumina brick pages.
- `/industries` — sector overview and installation services.
- `/research` — research and development.
- `/contact` — sales details and enquiry form connected to the enquiry API; accepts `?type=`, `?product=` (slug) and `?topic=`.
- `/careers` — speculative career enquiry route.
- `/admin` — staff dashboard (also `/ar/admin`), with sections shown by staff role:
  - Enquiries: list with filters, search and pagination; detail with status, assignment and notification retry.
  - Products and sectors: create, edit, hide or delete, in both languages, with photos, grades and datasheet PDFs for the menus.
  - Page text: every piece of site copy in English and Arabic, with search and reset to the built-in text.
  - Media: upload and manage images and PDFs, and pick them from any photo or PDF field.
  - Company: name, emails, phone, address, legal details and the page photos.
  - Staff: accounts, roles and deactivation.

## Customize

- Product families and industries: `src/lib/data.ts`.
- Homepage content: `src/app/page.tsx`; slides: `src/components/hero.tsx`.
- Design tokens and responsive styles: `src/app/globals.css`.
- Shared navigation and footer: `src/components/site-header.tsx` and `site-footer.tsx`.
- Contact behaviour: `src/components/contact-form.tsx`; API client: `src/lib/enquiry.ts`.
- Branding/photos: `public/images`; fonts: `public/fonts`.

## Backend requirements

See [BACKEND_REQUIREMENTS.md](BACKEND_REQUIREMENTS.md) for the proposed enquiry API, storage, email delivery, staff access, frontend integration, optional CMS/order features, and implementation checklist. This is a requirements document; backend functionality has not been implemented.

## Current integration scope

The enquiry form submits directly from the browser to the enquiry API (`POST /enquiries`, Laravel, docs at https://project2.gfoura.com/docs/api). Set the base URL with `NEXT_PUBLIC_ENQUIRY_API_URL` (see `.env.example`; defaults to `https://project2.gfoura.com/api/v1`). The API must allow the site origin through CORS; it currently allows `https://project1.gfoura.com`, so submissions from `localhost` fail until that origin is added. Enquiry type comes from the link (`/contact?type=sales|technical|career`), products are sent by slug (`?product=<slug>`), and `?topic=` prefills the topic. Each submission sends an `Idempotency-Key` that is reused on retries of unchanged content. The staff area under `/admin` calls the API from the Next.js server with a bearer token kept in an httpOnly cookie (`ADMIN_API_URL` overrides the API base URL).

Site content (products, sectors, navigation menus) is read on the server by `src/lib/content.ts` from proposed API endpoints (`/products`, `/industries`, `/menus/products`, `/menus/sectors`) and cached for 5 minutes. When an endpoint is missing, fails, or returns null/empty data, the local data in `src/lib/data.ts` and `src/lib/menu.ts` is used, and null fields on matching items are filled from the local copy. `CONTENT_API_URL` overrides the base URL.

This is an English website. It does not connect to the original site's order placement or order tracking systems, and does not include a CMS, authentication, payment processing, or vacancy management. Those require separate integrations. No production deployment has been made. Search indexing is disabled in `src/app/layout.tsx` for this preview; review branding/content and configure production metadata before publishing.

## Languages

- English is served on unprefixed URLs (`/products`); Arabic under `/ar` (`/ar/products`) with `dir="rtl"`. `next.config.ts` rewrites English requests to the internal `/en` segment and redirects `/en/...` to the unprefixed URL.
- Locale routing uses path-only redirects and internal rewrites so English navigation does not depend on the server hostname. Rebuild and restart the Next.js server when deploying changes to these rules; copying static assets alone does not apply them.
- All routes live under `src/app/[lang]/`. Copy is in `src/i18n/dictionaries/en.ts` and `ar.ts` (the Arabic dictionary is type-checked against the English one). Product and sector text for both languages is in `src/lib/data.ts`.
- The staff area is bilingual too: `/admin` and `/ar/admin`.
- Arabic uses IBM Plex Sans Arabic (body) and Cairo (headings) via `next/font/google`.

## Dashboard content management

The dashboard edits content stored by the backend API. The endpoints it needs are specified in [docs/BACKEND_CMS_SPEC.md](docs/BACKEND_CMS_SPEC.md), with seed data from the current site in [docs/cms-seed.json](docs/cms-seed.json). Until an endpoint exists, its section shows "Not available yet" and the public site keeps using the built-in content in `src/lib/data.ts`, `src/lib/site.ts`, `src/lib/settings.ts`, and `src/i18n/dictionaries/`.

- The site reads `/settings`, `/content`, `/products`, `/industries`, `/menus/products`, and `/menus/sectors` on the server (`src/lib/content.ts`), cached for 5 minutes under the `content` tag. Page-text overrides are merged over the dictionaries in `src/i18n/dictionaries.ts`.
- Dashboard saves run as server actions (`src/app/[lang]/admin/cms-actions.ts`) and expire the `content` tag, so the site updates on the next page load.
- `POST /api/revalidate` with header `X-Revalidate-Secret: $REVALIDATE_SECRET` refreshes the cache after changes made outside the dashboard.
- Media uploads pass through the Next server (server action body limit 21 MB). Images from hosts other than the API need to be listed in `MEDIA_HOSTS`.

## Contact channels

The footer and contact page show clickable company phone numbers plus WhatsApp and LinkedIn when configured. Local defaults are in `src/lib/site.ts`; `SiteSettings` uses `whatsappPhone` and `linkedinUrl`. WhatsApp opens `wa.me` with the international number; LinkedIn opens the configured company/profile URL. Both open in a new tab.

The Company form in the dashboard sends nullable `whatsapp_phone` and `linkedin_url` fields. The backend must validate, persist, and return these fields in the public settings response; see [the settings contract](docs/BACKEND_CMS_SPEC.md#34-company-settings). Missing API fields use local defaults; explicit `null` hides the channel. No WhatsApp account or LinkedIn page is assumed when its destination has not been supplied.

## First-visit intro

A Three.js kiln-arch intro (`src/components/intro/`) plays once per browser session on any public page, then lifts to reveal the page. It can be skipped (button, click, Esc/Enter/Space), is not shown with `prefers-reduced-motion`, and Three.js is loaded only while it plays.

## Product catalogue

The product range comes from the Ajyad Thermotech catalogue (`public/catalogue/ajyad-catalogue.pdf`, compressed from the supplied 38.5 MB file to 2 MB). Each product page links its own datasheet, a single catalogue page split into `public/catalogue/<slug>.pdf`, plus the full catalogue. The products dropdown and the products page also link them. Technical data tables and applications are in `src/lib/data.ts`, copied as printed in the catalogue.

The CMS is the source of truth once it returns products. Loading the new catalogue into the backend is described in [docs/BACKEND_CATALOGUE_UPDATE.md](docs/BACKEND_CATALOGUE_UPDATE.md). Until that's done, the site shows the backend's older products. Tests always use the built-in content (`CONTENT_API_URL` points to an unreachable address in `playwright.config.ts`).

## Placeholders before launch

Company details live in `src/lib/site.ts`. Before publishing, replace:

- Optionally `secondaryEmail` and `phone` (hidden while null). The contact email is `info@ajyad.online`.
- Photos in `public/images/catalogue/` were cut from the Ajyad catalogue; replace them with higher-resolution originals when available (from the dashboard's company settings or the product pages).
- The logo (`public/images/ajyad-logo.png`, favicon `src/app/icon.png`) was rendered from the supplied `AJYAD LOOG.eps`, which is black-only, and recoloured to match the brand mockup. Swap in official colour artwork when available.

Asfour-specific content was removed: company history and figures, address and phone, client logos, product grade codes, and links to Asfour datasheets and sector brochures.

## Verification

The production build and TypeScript checks passed. All 34 Playwright checks passed against the production preview, including both homepage actions from `/`, `/en/`, and `/ar` on desktop and mobile. Locale redirects, English/Arabic page navigation, catalogue flows, enquiry submissions, and staff sign-in boundaries are covered. Local preview: http://127.0.0.1:3100. This verification is local; the routing fix still needs deployment to the public server.
