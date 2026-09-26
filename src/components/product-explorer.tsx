"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Search, X } from "lucide-react";
import { fill, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Product } from "@/lib/data";

type Category = Product["category"];

export function ProductPreview({ lang, t, products }: { lang: Locale; t: Dictionary["productPreview"]; products: Product[] }) {
  const [category, setCategory] = useState<Category>("Shaped");
  const count = (c: Category) => products.filter(p => p.category === c).length;
  return <div className="product-preview"><div className="product-preview-image"><Image key={category} src={category === "Shaped" ? "/images/production.jpg" : "/images/about.jpg"} alt={category === "Shaped" ? t.imageShaped : t.imageUnshaped} fill sizes="(max-width: 760px) 100vw, 45vw" /><span className="image-tag">{t.tag}</span></div><div className="product-preview-content"><div className="product-tabs" role="group" aria-label={t.tabs}>{(["Shaped", "Unshaped"] as const).map(item => <button key={item} aria-pressed={category === item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{t.tab[item]} <span>0{count(item)}</span></button>)}</div><div className="product-rows" key={category}>{products.filter(p => p.category === category).slice(0, 3).map((product, i) => <Link key={product.slug} href={localePath(lang, `/products/${product.slug}`)} className="product-row"><span className="row-number">0{i + 1}</span><div><h3>{product.name}</h3><p>{product.short}</p></div><ArrowUpRight size={24} /></Link>)}</div><Link href={localePath(lang, `/products?category=${category}`)} className="text-link">{t.viewAll[category]} <ArrowRight size={18} /></Link></div></div>;
}

export function ProductCatalogue({ lang, t, categories, products, initialCategory = "All" }: { lang: Locale; t: Dictionary["catalogue"]; categories: Dictionary["categories"]; products: Product[]; initialCategory?: string }) {
  const [category, setCategory] = useState(["Shaped", "Unshaped"].includes(initialCategory) ? initialCategory : "All");
  const [query, setQuery] = useState("");
  const filtered = products.filter(p => (category === "All" || p.category === category) && `${p.name} ${p.short} ${p.grades.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div><div className="catalogue-controls"><div className="filter-buttons" role="group" aria-label={t.filter}>{(["All", "Shaped", "Unshaped"] as const).map(item => <button key={item} onClick={() => setCategory(item)} className={category === item ? "selected" : ""} aria-pressed={category === item}>{item === "All" ? t.all : categories[item]}</button>)}</div><label className="search-field"><Search size={19} /><input aria-label={t.search} placeholder={t.searchPlaceholder} value={query} onChange={e => setQuery(e.target.value)} />{query && <button onClick={() => setQuery("")} aria-label={t.clearSearch}><X size={16} /></button>}</label></div><p className="results-count" role="status">{filtered.length === 1 ? t.countOne : fill(t.count, { count: filtered.length })}</p><div className="catalogue-grid">{filtered.map(p => <Link className="catalogue-item" key={p.slug} href={localePath(lang, `/products/${p.slug}`)}><div className="catalogue-image"><Image src={p.image} alt={fill(t.imageAlt, { category: categories[p.category] })} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw" /><span>{categories[p.category]}</span></div><div className="catalogue-item-title"><h2>{p.name}</h2><ArrowUpRight size={24} /></div><p>{p.short}</p></Link>)}</div>{filtered.length === 0 && <div className="empty-state"><h2>{t.emptyTitle}</h2><p>{t.emptyText}</p><button className="button button-blue" onClick={() => { setCategory("All"); setQuery(""); }}>{t.clear} <ArrowRight size={18} /></button></div>}</div>;
}
