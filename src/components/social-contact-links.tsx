import { ArrowUpRight, Facebook, Linkedin, MessageCircle } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { SiteSettings } from "@/lib/settings";
import { facebookHref, linkedinHref, whatsappHref } from "@/lib/contact-links";

type Props = {
  settings: Pick<SiteSettings, "whatsappPhone" | "linkedinUrl" | "facebookUrl">;
  t: Dictionary["contactLinks"];
  detailed?: boolean;
};

/** Shared destinations in the footer and contact page. Unconfigured channels stay hidden. */
export function SocialContactLinks({ settings, t, detailed = false }: Props) {
  const channels = [
    { key: "whatsapp", href: whatsappHref(settings.whatsappPhone), title: t.whatsapp, label: t.whatsappLabel, handle: settings.whatsappPhone, Icon: MessageCircle },
    { key: "facebook", href: facebookHref(settings.facebookUrl), title: t.facebook, label: t.facebookLabel, handle: "@asfourmr", Icon: Facebook },
    { key: "linkedin", href: linkedinHref(settings.linkedinUrl), title: t.linkedin, label: t.linkedinLabel, handle: "@asfourmr", Icon: Linkedin },
  ];

  return <>{channels.map(({ key, href, title, label, handle, Icon }) => {
    if (!href) return null;
    if (detailed) return <div key={key} className="contact-detail contact-social">
      <Icon size={22} aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <a className="text-link" href={href} target="_blank" rel="noopener noreferrer">
          {handle || label} <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </div>;
    return <a key={key} href={href} className={`contact-channel contact-channel-${key}`} target="_blank" rel="noopener noreferrer" aria-label={label}>
      <Icon size={15} aria-hidden="true" /><span>{title}</span><ArrowUpRight size={13} aria-hidden="true" />
    </a>;
  })}</>;
}

