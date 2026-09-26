"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, FileText, Menu, X } from "lucide-react";
import { productMenu, sectorMenu, type Datasheet } from "@/lib/menu";

type MenuKey = "products" | "sectors";
const links: [string, string, MenuKey?][] = [["/", "Home"], ["/about", "About us"], ["/products", "Products", "products"], ["/industries", "Sectors", "sectors"], ["/research", "R&D"], ["/contact", "Contact"]];
const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const pdf = { target: "_blank", rel: "noopener noreferrer" } as const;

function SheetLink({ sheet, onClick }: { sheet: Datasheet; onClick?: () => void }) {
  return <a href={sheet.url} {...pdf} className="sheet-link" onClick={onClick} aria-label={`${sheet.label} datasheet (PDF, opens in new tab)`}><FileText size={13} />{sheet.label}</a>;
}

function ProductsPanel({ close }: { close: () => void }) {
  const [active, setActive] = useState(productMenu[0].slug);
  const family = productMenu.find(f => f.slug === active) ?? productMenu[0];
  return <div className="nav-panel nav-panel-wide"><div className="container mega-inner">
    <div className="mega-families">{(["Shaped", "Unshaped"] as const).map(category => <div key={category}>
      <p className="eyebrow"><span className="small-square" />{category}</p>
      {productMenu.filter(f => f.category === category).map(f => <Link key={f.slug} href={`/products/${f.slug}`} className={f.slug === family.slug ? "selected" : ""} onMouseEnter={() => setActive(f.slug)} onFocus={() => setActive(f.slug)} onClick={close}>{f.name}<ArrowUpRight size={14} /></Link>)}
    </div>)}</div>
    <div className="mega-sheets">
      <div className="mega-sheets-head"><div><p className="eyebrow">Technical datasheets · PDF</p><h3>{family.name}</h3></div><Link href={`/products/${family.slug}`} className="text-link" onClick={close}>View product page <ArrowUpRight size={15} /></Link></div>
      {family.groups.map(group => <div key={group.name ?? "all"} className="sheet-group">{group.name && <h4>{group.name}</h4>}<div className="sheet-grid">{group.sheets.map(sheet => <SheetLink key={sheet.url} sheet={sheet} onClick={close} />)}</div></div>)}
    </div>
  </div></div>;
}

function SectorsPanel({ close }: { close: () => void }) {
  return <div className="nav-panel nav-panel-list"><p className="eyebrow">Sector brochures · PDF</p>{sectorMenu.map(sheet => <a key={sheet.url} href={sheet.url} {...pdf} onClick={close} aria-label={`${sheet.label} (PDF, opens in new tab)`}>{sheet.label}<FileText size={14} /></a>)}</div>;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuKey | null>(null);
  const [mobileMenu, setMobileMenu] = useState<MenuKey | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => { setOpen(false); setMenu(null); }, [pathname]);
  useEffect(() => {
    if (!open && !menu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (menu) { setMenu(null); (navRef.current?.querySelector(`[data-menu="${menu}"]`) as HTMLElement | null)?.focus(); }
      else { setOpen(false); toggleRef.current?.focus(); }
    };
    const onPointer = (event: PointerEvent) => { if (menu && !navRef.current?.contains(event.target as Node)) setMenu(null); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onPointer); };
  }, [open, menu]);
  const closeAll = () => { setMenu(null); setOpen(false); };
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));
  return <>
    <div className="utility-bar"><div className="container utility-inner"><span>ASFOUR FOR MINING & REFRACTORIES</span><a href="mailto:sales@asfourmr.com">sales@asfourmr.com <ArrowUpRight size={12} /></a></div></div>
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Asfour home" onClick={() => setOpen(false)}><span className="logo-window"><Image src="/images/logo.png" alt="Asfour for Mining and Refractories" width={150} height={150} priority /></span></Link>
        <nav ref={navRef} className="desktop-nav" aria-label="Main navigation">{links.map(([href, title, key]) => {
          const top = <Link key={href} href={href} className={`nav-top${isActive(href) ? " active" : ""}`} aria-current={pathname === href ? "page" : undefined}>{title}</Link>;
          if (!key) return top;
          return <div key={href} className={`nav-item${key === "products" ? " nav-item-wide" : ""}${menu === key ? " open" : ""}`} onMouseEnter={() => { if (canHover()) setMenu(key); }} onMouseLeave={() => { if (canHover()) setMenu(null); }}>
            {top}
            <button type="button" className="nav-caret" data-menu={key} aria-label={`${title} menu`} aria-expanded={menu === key} onClick={event => setMenu(menu !== key || (event.detail > 0 && canHover()) ? key : null)}><ChevronDown size={14} /></button>
            {menu === key && (key === "products" ? <ProductsPanel close={closeAll} /> : <SectorsPanel close={closeAll} />)}
          </div>;
        })}</nav>
        <Link className="button button-blue header-cta" href="/contact" onClick={() => setOpen(false)}>Let’s talk <ArrowUpRight size={18} /></Link>
        <button ref={toggleRef} className="menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{links.map(([href, title, key]) => {
        const top = <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{title}<ArrowUpRight size={20} /></Link>;
        if (!key) return top;
        const expanded = mobileMenu === key;
        return <div key={href} className="mobile-group">
          <div className="mobile-group-head">{top}<button type="button" aria-label={`${title} menu`} aria-expanded={expanded} onClick={() => setMobileMenu(expanded ? null : key)}><ChevronDown size={20} /></button></div>
          {expanded && (key === "products"
            ? <div className="mobile-sub">{productMenu.map(f => <details key={f.slug}><summary>{f.name}<ChevronDown size={16} /></summary><Link href={`/products/${f.slug}`} className="mobile-page-link" onClick={() => setOpen(false)}>View product page <ArrowUpRight size={14} /></Link>{f.groups.map(g => <div key={g.name ?? "all"} className="sheet-group">{g.name && <h4>{g.name}</h4>}<div className="sheet-grid">{g.sheets.map(sheet => <SheetLink key={sheet.url} sheet={sheet} />)}</div></div>)}</details>)}</div>
            : <div className="mobile-sub mobile-sectors">{sectorMenu.map(sheet => <a key={sheet.url} href={sheet.url} {...pdf}>{sheet.label}<FileText size={16} /></a>)}</div>)}
        </div>;
      })}<Link href="/contact" className="button button-blue" onClick={() => setOpen(false)}>Discuss your project <ArrowUpRight size={18} /></Link></nav>}
    </header>
  </>;
}
