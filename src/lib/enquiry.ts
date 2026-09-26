import type { Product } from "@/lib/data";

export type EnquiryType = "sales" | "technical" | "career";
export const enquiryTypes: EnquiryType[] = ["sales", "technical", "career"];

export const ENQUIRY_API_URL = (process.env.NEXT_PUBLIC_ENQUIRY_API_URL ?? "https://project2.gfoura.com/api/v1").replace(/\/$/, "");

export type EnquiryPayload = {
  type: EnquiryType;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  productSlug: string | null;
  topic: string | null;
  message: string;
  website: string | null;
};

export type EnquiryResult =
  | { ok: true; reference: string }
  | { ok: false; kind: "validation"; fields: Record<string, string> }
  | { ok: false; kind: "rate-limit"; retryAfter: number | null }
  | { ok: false; kind: "conflict" | "too-large" | "unavailable" | "network" | "request" };

export async function submitEnquiry(payload: EnquiryPayload, idempotencyKey: string): Promise<EnquiryResult> {
  let response: Response;
  try {
    response = await fetch(`${ENQUIRY_API_URL}/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (response.ok) {
    try {
      const body = await response.json();
      if (typeof body?.reference === "string") return { ok: true, reference: body.reference };
    } catch {}
    return { ok: false, kind: "unavailable" };
  }
  if (response.status === 422) {
    let body: { errors?: Record<string, string[]> } = {};
    try { body = await response.json(); } catch {}
    return { ok: false, kind: "validation", fields: Object.fromEntries(Object.entries(body.errors ?? {}).map(([key, messages]) => [key, messages[0] ?? ""])) };
  }
  if (response.status === 409) return { ok: false, kind: "conflict" };
  if (response.status === 429) {
    const seconds = Number(response.headers.get("Retry-After"));
    return { ok: false, kind: "rate-limit", retryAfter: Number.isFinite(seconds) && seconds > 0 ? seconds : null };
  }
  if (response.status === 413) return { ok: false, kind: "too-large" };
  if (response.status >= 500) return { ok: false, kind: "unavailable" };
  return { ok: false, kind: "request" };
}

/** Resolves the `/contact` query string into an explicit enquiry type, a known product slug, and topic text. */
export function resolveEnquiryPrefill(products: Product[], params: { type?: string; product?: string; topic?: string }) {
  const product = products.find(p => p.slug === params.product || p.name === params.product);
  const legacyCareer = params.product === "Career enquiry";
  const type: EnquiryType = enquiryTypes.includes(params.type as EnquiryType) ? (params.type as EnquiryType) : legacyCareer ? "career" : "sales";
  const topic = params.topic ?? product?.name ?? (legacyCareer ? "" : params.product) ?? "";
  return { type, productSlug: product?.slug ?? null, topic: topic.slice(0, 160) };
}
