import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export function PageHead({ eyebrow, title, action, back }: { eyebrow?: string; title: string; action?: { href: string; label: string }; back?: { href: string; label: string } }) {
  return <>
    {back && <Link href={back.href} className="admin-back"><ArrowLeft size={16} aria-hidden="true" /> {back.label}</Link>}
    <div className="admin-heading">
      <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1></div>
      {action && <Link href={action.href} className="button button-blue"><Plus size={16} aria-hidden="true" /> {action.label}</Link>}
    </div>
  </>;
}
