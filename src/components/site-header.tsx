"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, FileText, Globe, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { fill, localePath, stripLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Datasheet, MenuFamily } from "@/lib/menu";

type Nav = Dictionary["nav"];
type MenuKey = "products" | "sectors";
export type SectorLink = { label: string; href: string; pdf: boolean };

const pdf = { target: "_blank", rel: "noopener noreferrer" } as const;
const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function SheetLink({ sheet, t, onClick }: { sheet: Datasheet; t: Nav; onClick?: () => void }) {
  return <a href={sheet.url} {...pdf} className="sheet-link" onClick={onClick} aria-label={fill(t.pdfNewTab, { label: sheet.label })}><FileText size={13} />{sheet.label}</a>;
}

function ProductsPanel({ lang, t, productMenu, close }: { lang: Locale; t: Nav; productMenu: MenuFamily[]; close: () => void }) {
  const [active, setActive] = useState(productMenu[0]?.slug);
  const family = productMenu.find(f => f.slug === active) ?? productMenu[0];
  if (!family) return null;
  const productHref = (slug: string) => localePath(lang, `/products/${slug}`);
  return <div className="nav-panel nav-panel-wide"><div className="container mega-inner">
    <div className="mega-families">{(["Shaped", "Unshaped"] as const).map(category => <div key={category}>
      <p className="eyebrow"><span className="small-square" />{category === "Shaped" ? t.shaped : t.unshaped}</p>
      {productMenu.filter(f => f.category === category).map(f => <Link key={f.slug} href={productHref(f.slug)} className={f.slug === family.slug ? "selected" : ""} onMouseEnter={() => setActive(f.slug)} onFocus={() => setActive(f.slug)} onClick={close}>{f.name}<ArrowUpRight size={14} /></Link>)}
    </div>)}</div>
    <div className="mega-sheets">
      <div className="mega-sheets-head"><div><p className="eyebrow">{t.datasheets}</p><h3>{family.name}</h3></div><Link href={productHref(family.slug)} className="text-link" onClick={close}>{t.viewProductPage} <ArrowUpRight size={15} /></Link></div>
      {family.groups.length
        ? family.groups.map(group => <div key={group.name ?? "all"} className="sheet-group">{group.name && <h4>{group.name}</h4>}<div className="sheet-grid">{group.sheets.map(sheet => <SheetLink key={sheet.url} sheet={sheet} t={t} onClick={close} />)}</div></div>)
        : <div className="mega-empty"><p>{t.datasheetsOnRequest}</p><Link href={localePath(lang, `/contact?product=${family.slug}`)} className="button button-outline" onClick={close}>{t.requestDatasheet} <ArrowUpRight size={16} /></Link></div>}
    </div>
  </div></div>;
}

function SectorsPanel({ t, sectors, close }: { t: Nav; sectors: SectorLink[]; close: () => void }) {
  const brochures = sectors.some(s => s.pdf);
  return <div className="nav-panel nav-panel-list"><p className="eyebrow">{brochures ? t.sectorBrochures : t.sectorsList}</p>{sectors.map(s => s.pdf
    ? <a key={s.href} href={s.href} {...pdf} onClick={close} aria-label={fill(t.pdfNewTab, { label: s.label })}>{s.label}<FileText size={14} /></a>
    : <Link key={s.href} href={s.href} onClick={close}>{s.label}<ArrowUpRight size={14} /></Link>)}</div>;
}

export function SiteHeader({ lang, t, company, productMenu, sectors }: { lang: Locale; t: Nav; company: { fullName: string; email: string }; productMenu: MenuFamily[]; sectors: SectorLink[] }) {
  const pathname = usePathname();
  const path = stripLocale(pathname);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuKey | null>(null);
  const [mobileMenu, setMobileMenu] = useState<MenuKey | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => { setOpen(false); setMenu(null); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
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

  const links: [string, string, MenuKey?][] = [["/", t.home], ["/about", t.about], ["/products", t.products, "products"], ["/industries", t.sectors, "sectors"], ["/research", t.research], ["/contact", t.contact]];
  const href = (p: string) => localePath(lang, p);
  const closeAll = () => { setMenu(null); setOpen(false); };
  const isActive = (p: string) => path === p || (p !== "/" && path.startsWith(p));
  const otherLang: Locale = lang === "en" ? "ar" : "en";
  const switcher = <Link href={localePath(otherLang, path)} className="lang-switch" hrefLang={otherLang} lang={otherLang} aria-label={t.switchLanguageLabel} onClick={() => setOpen(false)}><Globe size={15} aria-hidden="true" />{t.switchLanguage}</Link>;

  return <>
    <div className="utility-bar"><div className="container utility-inner"><span>{company.fullName.toUpperCase()}</span><div className="utility-links">{switcher}<a href={`mailto:${company.email}`}>{company.email} <ArrowUpRight size={12} /></a></div></div></div>
    <header className={`site-header${scrolled ? " scrolled" : ""}`}>
      <div className="container header-inner">
        <Link href={href("/")} className="brand" aria-label={t.home_aria} onClick={() => setOpen(false)}><Logo alt={company.fullName} priority /></Link>
        <nav ref={navRef} className="desktop-nav" aria-label={t.mainNavigation}>{links.map(([p, title, key]) => {
          const top = <Link key={p} href={href(p)} className={`nav-top${isActive(p) ? " active" : ""}`} aria-current={path === p ? "page" : undefined}>{title}</Link>;
          if (!key) return top;
          return <div key={p} className={`nav-item${key === "products" ? " nav-item-wide" : ""}${menu === key ? " open" : ""}`} onMouseEnter={() => { if (canHover()) setMenu(key); }} onMouseLeave={() => { if (canHover()) setMenu(null); }}>
            {top}
            <button type="button" className="nav-caret" data-menu={key} aria-label={fill(t.menu, { title })} aria-expanded={menu === key} onClick={event => setMenu(menu !== key || (event.detail > 0 && canHover()) ? key : null)}><ChevronDown size={14} /></button>
            {menu === key && (key === "products" ? <ProductsPanel lang={lang} t={t} productMenu={productMenu} close={closeAll} /> : <SectorsPanel t={t} sectors={sectors} close={closeAll} />)}
          </div>;
        })}</nav>
        <Link className="button button-blue header-cta" href={href("/contact")} onClick={() => setOpen(false)}>{t.cta} <ArrowUpRight size={18} /></Link>
        <button ref={toggleRef} className="menu-toggle" aria-label={open ? t.closeNavigation : t.openNavigation} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav id="mobile-navigation" className="mobile-nav" aria-label={t.mobileNavigation}>{links.map(([p, title, key]) => {
        const top = <Link key={p} href={href(p)} aria-current={path === p ? "page" : undefined} onClick={() => setOpen(false)}>{title}<ArrowUpRight size={20} /></Link>;
        if (!key) return top;
        const expanded = mobileMenu === key;
        return <div key={p} className="mobile-group">
          <div className="mobile-group-head">{top}<button type="button" aria-label={fill(t.menu, { title })} aria-expanded={expanded} onClick={() => setMobileMenu(expanded ? null : key)}><ChevronDown size={20} /></button></div>
          {expanded && (key === "products"
            ? <div className="mobile-sub">{productMenu.map(f => <details key={f.slug}><summary>{f.name}<ChevronDown size={16} /></summary><Link href={href(`/products/${f.slug}`)} className="mobile-page-link" onClick={() => setOpen(false)}>{t.viewProductPage} <ArrowUpRight size={14} /></Link>{f.groups.map(g => <div key={g.name ?? "all"} className="sheet-group">{g.name && <h4>{g.name}</h4>}<div className="sheet-grid">{g.sheets.map(sheet => <SheetLink key={sheet.url} sheet={sheet} t={t} />)}</div></div>)}</details>)}</div>
            : <div className="mobile-sub mobile-sectors">{sectors.map(s => s.pdf
              ? <a key={s.href} href={s.href} {...pdf}>{s.label}<FileText size={16} /></a>
              : <Link key={s.href} href={s.href} onClick={() => setOpen(false)}>{s.label}<ArrowUpRight size={16} /></Link>)}</div>)}
        </div>;
      })}{switcher}<Link href={href("/contact")} className="button button-blue" onClick={() => setOpen(false)}>{t.mobileCta} <ArrowUpRight size={18} /></Link></nav>}
    </header>
  </>;
}
