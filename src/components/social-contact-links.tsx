import { ArrowUpRight, Linkedin, MessageCircle } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { SiteSettings } from "@/lib/settings";
import { linkedinHref, whatsappHref } from "@/lib/contact-links";

type Props = {
  settings: Pick<SiteSettings, "whatsappPhone" | "linkedinUrl">;
  t: Dictionary["contactLinks"];
  detailed?: boolean;
};

/** Shared destinations in the footer and contact page. Unconfigured channels stay hidden. */
export function SocialContactLinks({ settings, t, detailed = false }: Props) {
  const channels = [
    { key: "whatsapp", href: whatsappHref(settings.whatsappPhone), title: t.whatsapp, label: t.whatsappLabel, Icon: MessageCircle },
    { key: "linkedin", href: linkedinHref(settings.linkedinUrl), title: t.linkedin, label: t.linkedinLabel, Icon: Linkedin },
  ];

  return <>{channels.map(({ key, href, title, label, Icon }) => {
    if (!href) return null;
    if (detailed) return <div key={key} className="contact-detail contact-social">
      <Icon size={22} aria-hidden="true" />
      <div><h3>{title}</h3><a className="text-link" href={href} target="_blank" rel="noopener noreferrer">{label}<ArrowUpRight size={16} aria-hidden="true" /></a></div>
    </div>;
    return <a key={key} href={href} className={`contact-channel contact-channel-${key}`} target="_blank" rel="noopener noreferrer" aria-label={label}>
      <Icon size={15} aria-hidden="true" /><span>{title}</span><ArrowUpRight size={13} aria-hidden="true" />
    </a>;
  })}</>;
}
