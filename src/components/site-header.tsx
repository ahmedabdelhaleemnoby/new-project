"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [["/", "Home"], ["/about", "About us"], ["/products", "Products"], ["/industries", "Industries"], ["/research", "R&D"], ["/contact", "Contact"]];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggleRef.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return <>
    <div className="utility-bar"><div className="container utility-inner"><span>ASFOUR FOR MINING & REFRACTORIES</span><a href="mailto:sales@asfourmr.com">sales@asfourmr.com <ArrowUpRight size={12} /></a></div></div>
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Asfour home" onClick={() => setOpen(false)}><span className="logo-window"><Image src="/images/logo.png" alt="Asfour for Mining and Refractories" width={150} height={150} priority /></span></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{links.map(([href, title]) => <Link key={href} href={href} className={pathname === href || (href !== "/" && pathname.startsWith(href)) ? "active" : ""} aria-current={pathname === href ? "page" : undefined}>{title}</Link>)}</nav>
        <Link className="button button-blue header-cta" href="/contact" onClick={() => setOpen(false)}>Let’s talk <ArrowUpRight size={18} /></Link>
        <button ref={toggleRef} className="menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{links.map(([href, title]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{title}<ArrowUpRight size={20} /></Link>)}<Link href="/contact" className="button button-blue" onClick={() => setOpen(false)}>Discuss your project <ArrowUpRight size={18} /></Link></nav>}
    </header>
  </>;
}
