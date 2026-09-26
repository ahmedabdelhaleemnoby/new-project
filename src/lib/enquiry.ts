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
  | { ok: false; kind: "validation"; message: string; fields: Record<string, string> }
  | { ok: false; kind: "conflict" | "rate-limit" | "unavailable" | "network" | "request"; message: string };

const fallback = "Your enquiry could not be sent. Please try again, or email sales@asfourmr.com.";

async function errorMessage(response: Response) {
  try {
    const body = await response.json();
    return (typeof body?.error?.message === "string" && body.error.message) || (typeof body?.message === "string" && body.message) || null;
  } catch {
    return null;
  }
}

export async function submitEnquiry(payload: EnquiryPayload, idempotencyKey: string): Promise<EnquiryResult> {
  let response: Response;
  try {
    response = await fetch(`${ENQUIRY_API_URL}/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, kind: "network", message: "We couldn’t reach our enquiry service. Check your connection and try again, or email sales@asfourmr.com." };
  }

  if (response.ok) {
    try {
      const body = await response.json();
      if (typeof body?.reference === "string") return { ok: true, reference: body.reference };
    } catch {}
    return { ok: false, kind: "unavailable", message: fallback };
  }

  if (response.status === 422) {
    let body: { message?: string; errors?: Record<string, string[]> } = {};
    try { body = await response.json(); } catch {}
    const fields = Object.fromEntries(Object.entries(body.errors ?? {}).map(([key, messages]) => [key, messages[0] ?? "Check this field."]));
    return { ok: false, kind: "validation", message: "Check the highlighted fields.", fields };
  }
  if (response.status === 409) return { ok: false, kind: "conflict", message: "This enquiry changed after it was first sent. Send it again to submit it as a new enquiry." };
  if (response.status === 429) {
    const seconds = Number(response.headers.get("Retry-After"));
    const wait = Number.isFinite(seconds) && seconds > 0 ? (seconds < 90 ? `${Math.ceil(seconds)} seconds` : `${Math.ceil(seconds / 60)} minutes`) : "a few minutes";
    return { ok: false, kind: "rate-limit", message: `Too many enquiries were sent from this connection. Please try again in ${wait}.` };
  }
  if (response.status === 413) return { ok: false, kind: "request", message: "Your enquiry is too long. Shorten the message and try again." };
  if (response.status >= 500) return { ok: false, kind: "unavailable", message: (await errorMessage(response)) ?? fallback };
  return { ok: false, kind: "request", message: fallback };
}

/** Resolves the `/contact` query string into an explicit enquiry type, a known product slug, and topic text. */
export function resolveEnquiryPrefill(products: Product[], params: { type?: string; product?: string; topic?: string }) {
  const product = products.find(p => p.slug === params.product || p.name === params.product);
  const legacyCareer = params.product === "Career enquiry";
  const type: EnquiryType = enquiryTypes.includes(params.type as EnquiryType) ? (params.type as EnquiryType) : legacyCareer ? "career" : "sales";
  const topic = params.topic ?? product?.name ?? (legacyCareer ? "" : params.product) ?? "";
  return { type, productSlug: product?.slug ?? null, topic: topic.slice(0, 160) };
}
