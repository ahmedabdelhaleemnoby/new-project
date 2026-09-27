# Backend update: load the new Ajyad catalogue

**For:** backend team (`https://project2.gfoura.com/api/v1`)
**Why:** The website now uses Ajyad Thermotech's real product catalogue. The CMS still holds the first seed (9 placeholder products copied from another company's range), and the public site shows whatever the CMS returns, so the new catalogue is not visible until the data below is updated.

Everything needed is in [`cms-seed.json`](cms-seed.json) (regenerated). The PDFs and photos are already served by the website:

- Full catalogue: `https://project1.gfoura.com/catalogue/ajyad-catalogue.pdf`
- One datasheet PDF per product: `https://project1.gfoura.com/catalogue/<slug>.pdf`
- Product and page photos: `https://project1.gfoura.com/images/catalogue/<name>.jpg`

The seed uses site-relative paths (`/catalogue/…`, `/images/catalogue/…`). The site accepts these as they are, or you can upload the files to the media library and store the returned absolute URLs.

---

## 1. Replace the products (required)

Delete the 9 existing products (`lightweight-bricks`, `dense-alumina-bricks`, `cordierite-mullite-bricks`, `chemical-bond-bricks`, `acid-resistant-bricks`, `castables`, `mortars`, `chamotte`, `calcined-bauxite`). Then create the 9 products in `cms-seed.json` → `products`:

| Slug | Grade | Category |
| --- | --- | --- |
| `ebt-olivine-sand` | EBT Olivine Sand | Unshaped |
| `dry-backfill-mixes` | Dry Backfill Mix | Unshaped |
| `silica-ramming-mass` | Silica Ramming Mass | Unshaped |
| `hearth-ramming-mass` | ProRam-G | Unshaped |
| `hot-fettling-mass` | PT1700-85L | Unshaped |
| `hot-gunning-mass` | MgPT-90H | Unshaped |
| `tundish-spray-mass` | PT5001-HM | Unshaped |
| `blast-furnace-monolithics` | – | Unshaped |
| `pre-shaped-castables` | – | Shaped |

Each seed product includes:
- `featured_datasheet`: its PDF. The public `/products` response returns it as `datasheet: { label, url }`.
- `datasheet_groups`: the PDF for the products dropdown. The public `/menus/products` response returns it in `groups`.

**Keep the slugs exactly as listed.** The site matches products by slug, and it fills in any field the API leaves empty (grades, applications, technical data, datasheet) from its own copy of the catalogue.

## 2. Store the new product fields (recommended)

Products now have two optional fields, described in `BACKEND_CMS_SPEC.md` §2A and §3.1:

- `applications`: a list of `{ en, ar }` (admin). The public response resolves it to a list of strings.
- `specs`: the technical data table. In admin it's `{ title, sections: [{ name: {en, ar}, rows: [{ label: {en, ar}, value: {en, ar} }] }] }`. Public: `{ title, sections: [{ name, rows: [[label, value]] }] }`.

If you don't store them yet, the site still shows them from its local copy, as long as the slugs match. Store them so staff can edit them later.

## 3. Update the settings (required)

Update from `cms-seed.json` → `settings`:
- `phone`: `"+20 102 946 6668, +20 100 945 1944"`. Several numbers are separated by commas.
- `catalogue_url`: `/catalogue/ajyad-catalogue.pdf`. This is a new field and is returned by public `/settings`.
- `images`: all nine keys now point to catalogue photos. The current values (`/images/hero.jpg`, `/images/factory.jpg`, …) were placeholder photos from another company. They have been deleted from the website, so the site currently ignores them and uses its defaults.

## 4. Clear the page-text overrides (required)

`GET /content` currently returns **all 263 keys**, because the seed's default texts were imported as overrides. This freezes the old wording: any text improved in the website's code (for example the About page and home introduction, now describing the steel-industry range) is hidden behind these rows.

- Delete all rows from the content overrides table. `/content` should return `{ "data": {} }` until staff edit something.
- `cms-seed.json` → `content` is the **list of allowed keys**, for validating `PUT /admin/content`, not data to insert.

## 5. Enquiry product validation (required)

`POST /enquiries` still validates `productSlug` against the old hard-coded list, so enquiries from the new product pages are rejected with 422. The website works around this by resending without `productSlug`, but then staff lose the product reference.

- Validate `productSlug` against the slugs in the products table (published or not). See `BACKEND_CMS_SPEC.md` §3.1.

## 6. Still open from the first spec (if not done yet)

- [ ] `GET /admin/enquiries` returns each enquiry's `id`.
- [ ] Enquiry notifications go to `info@ajyad.online`, or better, to `settings.email`.
- [ ] `GET /admin/me` and the login response include the staff `id`.

---

## Checklist

- [ ] Old products deleted; the 9 catalogue products created with the exact slugs
- [ ] `applications` and `specs` stored and returned (recommended)
- [ ] Settings updated: `phone`, `catalogue_url`, `images`
- [ ] Content overrides table emptied; `/content` returns `{}`
- [ ] `productSlug` validated against the products table
- [ ] Check `GET /products?locale=ar` returns the Arabic names, and `GET /menus/products` returns one PDF per product
