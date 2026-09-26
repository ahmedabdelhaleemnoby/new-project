# Asfour M&R — Next.js website

A refreshed industrial website based on https://asfourmr.com, built with Next.js 16, React 19, TypeScript, and the App Router. Photography and fonts are stored locally. Images use Next.js image optimization.

## Run locally

The active project is `/Users/ahmedabuzyad/Developer/asfour-next`. Use this copy for development. The earlier copy in `/Users/ahmedabuzyad/Documents/New project` may be iCloud-offloaded, which can stall file reads and development commands.

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
- `/contact` — sales details and accessible enquiry form; accepts `?product=` for prefill.
- `/careers` — speculative career enquiry route.

## Customize

- Product families and industries: `src/lib/data.ts`.
- Homepage content: `src/app/page.tsx`; slides: `src/components/hero.tsx`.
- Design tokens and responsive styles: `src/app/globals.css`.
- Shared navigation and footer: `src/components/site-header.tsx` and `site-footer.tsx`.
- Contact behaviour: `src/components/contact-form.tsx`.
- Branding/photos: `public/images`; fonts: `public/fonts`.

## Backend requirements

See [BACKEND_REQUIREMENTS.md](BACKEND_REQUIREMENTS.md) for the proposed enquiry API, storage, email delivery, staff access, frontend integration, optional CMS/order features, and implementation checklist. This is a requirements document; backend functionality has not been implemented.

## Current integration scope

The enquiry form validates input and prepares a mailto draft that the visitor reviews and sends in their email app. It also offers a copy action. It does not send email from a backend, store leads, or show a false delivery confirmation. Career enquiries use an optional company field. For direct submission, connect an email/CRM provider and add server-side validation and delivery handling.

This is an English website. It does not connect to the original site's order placement or order tracking systems, and does not include a CMS, authentication, payment processing, or vacancy management. Those require separate integrations. No production deployment has been made. Search indexing is disabled in `src/app/layout.tsx` for this preview; review branding/content and configure production metadata before publishing.

## Reference and asset sources

The user supplied the Asfour website and chose a refreshed design using its branding/content. Copy has been rewritten and reorganized. Product names and source imagery are retained for this reference-based project.

- Company information and reported scale: https://asfourmr.com/about-us/ (1982, 2007, 500+ people, 100,000+ tons/year, 30+ countries).
- Product and sector navigation, client logos, homepage photography: https://asfourmr.com/.
- Contact details: https://asfourmr.com/contact-us/.
- R&D information/images: https://asfourmr.com/rd/.
- Technical PDFs link to the original Asfour documents rather than reproducing unverified specifications.
- Downloaded source image URLs are listed in `ASSET_SOURCES.md`.
- Typeface families: Barlow Condensed and Manrope, downloaded from Google Fonts (SIL Open Font License; included under `public/fonts`).

The original homepage reports 27+ countries while the About page reports 30+; this project uses the About page figure. Product suitability and current specifications are referred to the sales team.

## Verification

The production build and TypeScript checks passed. All 8 Playwright checks passed against the production preview, covering desktop and mobile flows. Local preview: http://127.0.0.1:3100.
