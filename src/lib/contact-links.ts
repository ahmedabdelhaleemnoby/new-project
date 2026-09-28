/** Format WhatsApp and social profile URLs from site settings. */

export function sanitizePhoneForWhatsApp(phone: string): string {
  // Extract only digits, handling international + prefix
  const digits = phone.replace(/[^\d]/g, "");
  // If phone starts with 0 and doesn't have country code, replace leading 0 with Egypt code 20
  if (digits.startsWith("01") && digits.length === 11) {
    return `20${digits.substring(1)}`;
  }
  return digits;
}

export function whatsappHref(phone: string | null | undefined, message?: string): string | null {
  if (!phone) return null;
  const digits = sanitizePhoneForWhatsApp(phone);
  if (!digits) return null;
  const base = `https://api.whatsapp.com/send/?phone=${digits}`;
  return message ? `${base}&text=${encodeURIComponent(message)}` : base;
}

export function linkedinHref(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  return `https://www.linkedin.com/company/${handle}`;
}

export function facebookHref(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  return `https://www.facebook.com/${handle}`;
}
