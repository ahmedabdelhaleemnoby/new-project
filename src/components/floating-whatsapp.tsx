"use client";

import { MessageCircle } from "lucide-react";
import { whatsappHref } from "@/lib/contact-links";
import type { Dictionary } from "@/i18n/dictionaries/en";

type Props = {
  phone: string | null;
  t: Dictionary["contactLinks"];
};

export function FloatingWhatsApp({ phone, t }: Props) {
  const href = whatsappHref(phone);
  if (!href) return null;

  return (
    <aside aria-label={t.whatsappLabel} className="floating-whatsapp-container">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-btn"
        aria-label={t.whatsappFloating || t.whatsappLabel}
        title={t.whatsappFloating || t.whatsappLabel}
      >
        <MessageCircle size={28} className="whatsapp-icon" aria-hidden="true" />
        <span className="floating-whatsapp-pulse" aria-hidden="true" />
        <span className="floating-whatsapp-tooltip">{t.whatsappFloating || t.whatsappLabel}</span>
      </a>
    </aside>
  );
}
