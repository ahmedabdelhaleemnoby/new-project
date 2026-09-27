# Backend requirements: dashboard CMS for the Ajyad Thermotech website

**For:** backend team (Laravel API at `https://project2.gfoura.com/api/v1`)
**From:** website team (Next.js site at `https://project1.gfoura.com`)
**Goal:** let staff control the whole public website from the dashboard. That covers products, sectors, page text in English and Arabic, images and PDFs, company details, and staff accounts. Existing enquiry handling stays as it is.

The dashboard screens are already built against the contract below. Until an endpoint exists, the matching screen shows "not available yet", and the public site keeps using its built-in content. Nothing breaks while this is being implemented.

Seed data with the current site content (the 9 products from the Ajyad catalogue with their technical data, sectors, company settings, and all page-text entries in both languages) is in [`cms-seed.json`](cms-seed.json). The catalogue PDF, per-product datasheet PDFs and product photos are in the website's `public/catalogue/` and `public/images/catalogue/` folders.

---

## 0. Fixes to the existing API (highest priority)

| # | Endpoint | Change | Why |
| --- | --- | --- | --- |
| 0.1 | `GET /admin/enquiries` | Include each enquiry's integer `id` in every item of `data`. | Detail, update, and notification endpoints take `{id}`, but the list only returns `reference`, so staff cannot open an enquiry from the list. |
| 0.2 | Notifications | Send enquiry notifications for **all groups** (sales/technical and career) to **`info@ajyad.online`**. Ideally read the recipient from `settings.email` (section 3.4) so it can be changed from the dashboard. | The site's contact address is now `info@ajyad.online`. |
| 0.3 | `GET /admin/me` | Also return `id` (integer). | Needed for "assign to me" and for hiding the current user's own delete/deactivate button. |
| 0.4 | CORS | Also allow `http://localhost:3200` (local development only; not needed in production). | Lets developers submit the enquiry form locally. |

---

## 1. Conventions

- **Format:** JSON request and response bodies (`Content-Type: application/json`), except media upload (`multipart/form-data`).
- **Field names:** `snake_case`.
- **Auth:** admin endpoints use the existing Sanctum bearer token from `POST /admin/login` (`Authorization: Bearer <token>`). Public endpoints need no auth.
- **Locales:** `en` and `ar`.
  - Translatable fields are objects: `{ "en": "…", "ar": "…" }`. Both keys are required in writes, but a value may be an empty string where noted.
  - Public endpoints take `?locale=en|ar` and return plain strings resolved for that locale. An unknown or missing locale falls back to `en`.
- **Errors:** keep the current shapes.
  - Validation: `422 { "message": "…", "errors": { "field": ["…"] } }`. Nested fields use dot paths, e.g. `name.ar` or `datasheet_groups.0.sheets.1.url`.
  - Other errors: `{ "error": { "code": "…", "message": "…" } }`, or Laravel's default `{ "message": "…" }`, using 401, 403, 404, 409, 413, or 503.
- **Pagination:** where lists are paginated, use the existing `{ "data": [...], "meta": { "current_page", "per_page", "total", "last_page" } }`.
- **Timestamps:** ISO 8601 (`created_at`, `updated_at`).
- **URLs:** media URLs must be absolute (`https://…`). The site accepts images from `https://project2.gfoura.com`. If files are served from another host (S3, CDN), tell the website team so it can be allow-listed.
- **Unknown fields:** ignore them in writes. Never accept `id`, `created_at`, or `updated_at` from the client.

---

## 2. Roles and permissions

Add a `role` to staff users (the current `/admin/me` already returns a `role` string). Enforce these on the server for every request; the dashboard hides menu items by role, but that is only a convenience.

| Capability | `admin` | `editor` | `sales` | `hr` |
| --- | :---: | :---: | :---: | :---: |
| Sales and technical enquiries (existing) | ✓ | – | ✓ | – |
| Career enquiries (existing) | ✓ | – | – | ✓ |
| Products, sectors, page text, media | ✓ | ✓ | – | – |
| Company settings | ✓ | ✓ | – | – |
| Staff accounts | ✓ | – | – | – |
| Staff options list (for assignment, 3.6) | ✓ | ✓ | ✓ | ✓ |

Return `403` for anything outside the role.

---

## 2A. Public read endpoints (no auth)

The site already calls these, with `?locale=en|ar`, and caches responses for 5 minutes. On any error, a 404, `null`, an empty list, or an invalid item, it falls back to its built-in content. Return **published items only**, ordered by `sort_order` ascending. Either a bare JSON array or `{ "data": [...] }` is accepted.

### `GET /settings?locale=en`

```json
{
  "data": {
    "name": "Ajyad",
    "full_name": "Ajyad Thermotech",
    "email": "info@ajyad.online",
    "secondary_email": { "email": "export@ajyad.online", "label": "Export sales" },
    "phone": "+20 102 946 6668, +20 100 945 1944",
    "address": { "lines": ["Arab Abu Saad Industrial Zone, 670", "Giza, Egypt"], "map_url": "https://www.google.com/maps/…" },
    "legal": { "form": "Limited liability company", "commercial_register": "295803", "tax_card": "774-139-552" },
    "catalogue_url": "https://…/ajyad-catalogue.pdf",
    "images": {
      "hero_1": "https://…", "hero_2": "https://…", "hero_3": "https://…",
      "about": "https://…", "research": "https://…", "laboratory": "https://…", "installation": "https://…",
      "preview_shaped": "https://…", "preview_unshaped": "https://…"
    }
  }
}
```

`secondary_email`, `phone`, and `address` may be `null` (the site hides them). `phone` may hold several numbers separated by commas. `catalogue_url` is the downloadable product catalogue (PDF). Any `images.*` key may be `null` (the site uses its built-in photo).

### `GET /content?locale=ar`

Page text overrides as a flat map of **key → string**. Return only keys that staff have changed. Keys not returned keep the site's built-in text. The full key list with current English and Arabic defaults is in `cms-seed.json` → `content`.

```json
{ "data": { "home.introLead": "…", "hero.slides.0.title.0": "…", "footer.tagline.1": "…" } }
```

Strings may contain placeholders in braces, such as `{year}`, `{name}`, `{count}`, or `{email}`. The site fills them in, so they must be kept.

### `GET /products?locale=en`

```json
[
  {
    "slug": "castables",
    "name": "Refractory castables",
    "category": "Unshaped",
    "short": "Versatile materials. Application-led specifications.",
    "description": "Choose from lightweight, low-cement …",
    "grades": ["LCC4001", "LCC4501"],
    "image": "https://project2.gfoura.com/storage/media/castables.jpg",
    "datasheet": { "label": "LCC4001 technical datasheet", "url": "https://…/LCC4001.pdf" },
    "applications": ["Filling the EBT taphole of electric arc furnaces", "Producing tundish cover"],
    "specs": {
      "title": "ProRam-G",
      "sections": [
        { "name": "Chemical properties", "rows": [["MgO", "80–85 %"], ["SiO₂", "1–2 %"]] },
        { "name": "Physical properties", "rows": [["Grain size, mm", "0–8"], ["Max service temperature, °C", "1750"]] }
      ]
    }
  }
]
```

- `category` is exactly `"Shaped"` or `"Unshaped"`.
- `grades` may be `[]`.
- `datasheet` is optional: the product's featured PDF, or omit the key.
- `applications` (list of strings) and `specs` (the technical data table: a title plus sections of `[label, value]` rows) are optional.

### `GET /industries?locale=en`

```json
[{ "slug": "iron-steel", "name": "Iron & steel", "text": "Refractory and insulation solutions …", "icon": "steel" }]
```

`icon` is one of `steel`, `cement`, `glass`, `aluminium`, `chemical`, `power`.

### `GET /menus/products?locale=en`

This is the products dropdown in the site header. It's derived from products and their datasheet groups (3.1).

```json
[
  {
    "slug": "dense-alumina-bricks",
    "name": "Dense alumina bricks",
    "category": "Shaped",
    "groups": [
      { "name": "Fire clay bricks", "sheets": [{ "label": "BFC30", "url": "https://…/BFC30.pdf" }] },
      { "name": "High alumina bricks", "sheets": [{ "label": "BHA45", "url": "https://…/BHA45.pdf" }] }
    ]
  }
]
```

- A group's `name` may be `null` for an ungrouped list.
- `groups` may be `[]`.

### `GET /menus/sectors?locale=en`

This is the sectors dropdown: sector brochures (PDF). It's derived from industries that have a `brochure_url`.

```json
[{ "label": "Iron & steel", "url": "https://…/iron-steel.pdf" }]
```

Return `[]` if no sector has a brochure; the site then links each sector to its section of the sectors page.

---

## 3. Admin endpoints (bearer auth)

### 3.1 Products

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/admin/products` | All products, including unpublished, ordered by `sort_order`. Not paginated (small set). |
| POST | `/admin/products` | Create. Returns `201 { "data": Product }`. |
| GET | `/admin/products/{id}` | `{ "data": Product }` |
| PATCH | `/admin/products/{id}` | Partial update; send only changed fields. Returns `{ "data": Product }`. |
| DELETE | `/admin/products/{id}` | `204`. |

**Product (admin shape):**

```json
{
  "id": 6,
  "slug": "castables",
  "category": "Unshaped",
  "sort_order": 6,
  "published": true,
  "image": "https://project2.gfoura.com/storage/media/castables.jpg",
  "name": { "en": "Refractory castables", "ar": "الخرسانات الحرارية" },
  "short": { "en": "…", "ar": "…" },
  "description": { "en": "…", "ar": "…" },
  "grades": ["LCC4001", "LCC4501"],
  "featured_datasheet": { "label": { "en": "LCC4001 technical datasheet", "ar": "النشرة الفنية LCC4001" }, "url": "https://…/LCC4001.pdf" },
  "datasheet_groups": [
    { "name": { "en": "Low-cement castables", "ar": "خرسانات منخفضة الأسمنت" }, "sheets": [{ "label": "LCC4001", "url": "https://…/LCC4001.pdf" }] }
  ],
  "applications": [{ "en": "Filling the EBT taphole of electric arc furnaces", "ar": "ملء فتحة الصب EBT في أفران القوس الكهربائي" }],
  "specs": {
    "title": "ProRam-G",
    "sections": [
      { "name": { "en": "Chemical properties", "ar": "الخواص الكيميائية" }, "rows": [{ "label": { "en": "MgO", "ar": "MgO" }, "value": { "en": "80–85 %", "ar": "80–85 %" } }] }
    ]
  },
  "created_at": "…",
  "updated_at": "…"
}
```

**Validation:**

| Field | Rule |
| --- | --- |
| `slug` | Required, unique, `^[a-z0-9]+(-[a-z0-9]+)*$`, max 80. **Used in public URLs**, so warn if changed after publishing (optional: keep old slugs as redirects). |
| `category` | Required, `Shaped` or `Unshaped`. |
| `name.en`, `name.ar` | Required, max 120. |
| `short.en`, `short.ar` | Required, max 200. |
| `description.en`, `description.ar` | Required, max 2000. |
| `image` | Required, absolute URL (normally a media library URL). |
| `grades` | Array of strings, each max 60, max 60 items. |
| `featured_datasheet` | Nullable. `url` must be an absolute URL to a PDF. |
| `datasheet_groups` | Array (max 30). Each group has `name` (nullable `{en, ar}`) and `sheets` (max 60), and each sheet has `label` (max 80) and `url` (absolute PDF URL). Replace the whole array on write. |
| `applications` | Array (max 20) of `{en, ar}`, each max 200. |
| `specs` | Nullable. `title` max 80. `sections` (max 6) each has `name` `{en, ar}` and `rows` (max 30) of `{ label: {en, ar}, value: {en, ar} }`, each max 80. Public endpoints resolve it to one locale (see 2A). |
| `sort_order` | Integer ≥ 0. |
| `published` | Boolean. Unpublished products are hidden from public endpoints. |

The website's enquiry form sends `productSlug`. Keep `StoreEnquiryRequest.productSlug` validated against **existing product slugs** instead of the current hard-coded enum.

### 3.2 Sectors (industries)

| Method | Path |
| --- | --- |
| GET | `/admin/industries` |
| POST | `/admin/industries` |
| GET, PATCH, DELETE | `/admin/industries/{id}` |

```json
{
  "id": 1, "slug": "iron-steel", "icon": "steel", "sort_order": 1, "published": true,
  "name": { "en": "Iron & steel", "ar": "الحديد والصلب" },
  "text": { "en": "…", "ar": "…" },
  "brochure_url": "https://…/iron-steel.pdf",
  "created_at": "…", "updated_at": "…"
}
```

**Validation:**
- `slug`: same rule as products, and unique among industries. It's used as a page anchor.
- `icon`: one of the six values listed in 2A.
- `name.*`: required, max 80.
- `text.*`: required, max 400.
- `brochure_url`: nullable absolute PDF URL.

### 3.3 Page text

| Method | Path | Body / response |
| --- | --- | --- |
| GET | `/admin/content` | `{ "data": { "en": { "key": "value" }, "ar": { "key": "value" } } }`: only the overridden keys. |
| PUT | `/admin/content` | `{ "locale": "ar", "values": { "home.introLead": "…", "footer.motto": null } }` |

The PUT response is the same shape as GET, after the update.

- A string value upserts the override. `null` deletes the override, which restores the built-in text.
- Keys must be from the allowed list: the `content[].key` values in `cms-seed.json`. Reject unknown keys with 422 so typos don't pile up.
- Max 4000 characters per value. Values may be empty strings.
- Keep `{placeholder}` tokens. Optionally validate that a value has the same `{…}` tokens as the default.
- Store as rows `(locale, key, value)` with a unique `(locale, key)`.

### 3.4 Company settings

| Method | Path |
| --- | --- |
| GET | `/admin/settings` → `{ "data": Settings }` |
| PATCH | `/admin/settings` (partial) → `{ "data": Settings }` |

**Settings (admin shape):**

```json
{
  "name": { "en": "Ajyad", "ar": "أجياد" },
  "full_name": { "en": "Ajyad Thermotech", "ar": "أجياد ثيرموتك" },
  "email": "info@ajyad.online",
  "secondary_email": null,
  "phone": "+20 102 946 6668, +20 100 945 1944",
  "catalogue_url": "https://…/ajyad-catalogue.pdf",
  "address": { "en": ["Arab Abu Saad Industrial Zone, 670", "Giza, Egypt"], "ar": ["المنطقة الصناعية بعرب أبو ساعد، 670", "الجيزة، مصر"], "map_url": "https://www.google.com/maps/…" },
  "legal": { "form": { "en": "Limited liability company", "ar": "شركة ذات مسؤولية محدودة" }, "commercial_register": "295803", "tax_card": "774-139-552" },
  "images": { "hero_1": null, "hero_2": null, "hero_3": null, "about": null, "research": null, "laboratory": null, "installation": null, "preview_shaped": null, "preview_unshaped": null },
  "updated_at": "…"
}
```

**Validation:**
- `email`: required, valid email.
- `secondary_email`: nullable. When present it's `{ "email": "…", "label": { "en": "…", "ar": "…" } }`.
- `phone`: nullable, max 120; several numbers are separated by commas.
- `catalogue_url`: nullable absolute URL to the catalogue PDF (normally a media library URL).
- `address`: nullable; each language has 1–4 lines, each max 120. `map_url` is an absolute URL.
- `legal.*`: max 60 each.
- `images.*`: nullable absolute URLs; the keys are fixed.

A single row or key-value table is fine. `GET /settings` (public) returns the same data resolved for one locale, as in 2A. **Use `email` as the enquiry notification recipient (0.2).**

### 3.5 Media library

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/admin/media?type=image\|pdf&search=&page=` | Paginated, newest first, 40 per page. |
| POST | `/admin/media` | `multipart/form-data`: `file` (required), `alt_en`, `alt_ar` (optional). Returns `201 { "data": Media }`. |
| PATCH | `/admin/media/{id}` | `{ "alt": { "en": "…", "ar": "…" } }` |
| DELETE | `/admin/media/{id}` | `204`. Return `409` if the file is referenced by a product, sector, or setting (list where), unless `?force=1`. |

```json
{ "id": 12, "url": "https://project2.gfoura.com/storage/media/2026/09/kiln.jpg", "filename": "kiln.jpg", "mime": "image/jpeg", "size": 482113, "width": 1920, "height": 1280, "alt": { "en": "…", "ar": "…" }, "created_at": "…" }
```

- **Accept:** `image/jpeg`, `image/png`, `image/webp` up to **10 MB**, and `application/pdf` up to **20 MB**.
- **Reject** SVG and HTML uploads, since they can carry scripts.
- **Validate** by content, not just extension.
- **Filenames:** store under random names and keep `filename` only for display.
- **Size:** `width` and `height` for images (null for PDFs).
- **Storage:** public disk (or S3) with absolute URLs. Images should ideally be resized so the long edge is at most 2400 px.
- The dashboard uploads through the Next.js server, so the upload comes from the site's server, not the browser. No CORS change is needed for this.

### 3.6 Staff accounts

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/admin/staff` | **admin only.** `{ "data": [Staff] }` |
| POST | `/admin/staff` | **admin only.** `{ "name", "email", "role", "password" }` returns `201 { "data": Staff }`. |
| PATCH | `/admin/staff/{id}` | **admin only.** Partial `{ "name", "role", "active", "password" }`. |
| GET | `/admin/staff/options` | **all roles.** `{ "data": [{ "id", "name" }] }` for active staff, used for assigning enquiries. |

```json
{ "id": 7, "name": "Mona Ali", "email": "mona@ajyad.online", "role": "sales", "active": true, "last_login_at": "…", "created_at": "…" }
```

- **Fields:** `role` is `admin`, `editor`, `sales`, or `hr`. `email` must be unique. `password` needs at least 12 characters, and is never returned.
- **Deactivation:** set `active: false`. The account then can't log in, and its tokens must be revoked immediately. There is no hard delete, which preserves the audit trail.
- **Guards:** an admin can't deactivate their own account or remove their own `admin` role (return 422). There must always be at least one active admin.
- **Login response:** also return `id` in `staff` (see 0.3).
- **Audit:** log staff changes (who, what, when).

---

## 4. Suggested tables

| Table | Main columns |
| --- | --- |
| `products` | `id`, `slug` (unique), `category`, `sort_order`, `published`, `image`, `name_en`, `name_ar`, `short_en`, `short_ar`, `description_en`, `description_ar`, `grades` (json), `featured_datasheet` (json, nullable), timestamps |
| `product_datasheet_groups` | `id`, `product_id`, `sort_order`, `name_en`, `name_ar` (nullable) |
| `product_datasheets` | `id`, `group_id`, `sort_order`, `label`, `url` |
| `industries` | `id`, `slug` (unique), `icon`, `sort_order`, `published`, `name_en`, `name_ar`, `text_en`, `text_ar`, `brochure_url` (nullable), timestamps |
| `content_overrides` | `id`, `locale`, `key`, `value`, `updated_by`, timestamps; unique (`locale`, `key`) |
| `settings` | single row, or key/value with JSON values |
| `media` | `id`, `disk`, `path`, `filename`, `mime`, `size`, `width`, `height`, `alt_en`, `alt_ar`, `uploaded_by`, timestamps |
| `staff` (existing users) | add `role`, `active`, `last_login_at` |
| `audit_events` (optional) | `id`, `staff_id`, `action`, `subject_type`, `subject_id`, `changes` (json), `created_at` |

Datasheet groups can be stored as JSON on the product instead of two tables, if that's simpler.

---

## 5. Seeding

Import [`cms-seed.json`](cms-seed.json):
- `settings` goes into the settings table.
- `products` (9) and `industries` (6) go into their tables. Their images currently point to the site's own files (`/images/…`). Re-upload these to the media library, or leave the `image` value empty and let staff pick new photos. The current photos are placeholders from another company's website and must be replaced.
- `content` is the **list of allowed page-text keys**, with the current defaults (`en`, `ar`). Don't insert them as overrides; use the keys only to validate `PUT /admin/content`.

---

## 6. Caching on the site

The site caches the public endpoints for 5 minutes. When staff save in the dashboard, the site refreshes its cache immediately. If content is ever changed **outside** the dashboard (seeders, tinker, another tool), call the site's revalidation hook afterwards:

```
POST https://project1.gfoura.com/api/revalidate
X-Revalidate-Secret: <shared secret, agreed privately>
```

It responds `200 { "revalidated": true }`.

---

## 7. Acceptance checklist

- [ ] 0.1 `id` in the enquiry list · 0.2 notifications to `info@ajyad.online` · 0.3 `id` in `/admin/me` and in login · 0.4 localhost CORS
- [ ] Roles enforced on the server (section 2)
- [ ] Public: `/settings`, `/content`, `/products`, `/industries`, `/menus/products`, `/menus/sectors` with `?locale=` and published-only
- [ ] Admin CRUD: products (with datasheet groups), industries, content overrides, settings
- [ ] Media upload, list, update, delete, with type, size, and content validation
- [ ] Staff management, with deactivation revoking tokens and a last-admin guard
- [ ] `productSlug` in enquiries validated against the products table
- [ ] Seed imported; OpenAPI docs (`/docs/api`) updated with the new endpoints
