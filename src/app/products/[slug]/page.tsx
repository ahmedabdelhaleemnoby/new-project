import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, FileDown, ArrowLeft } from "lucide-react";
import { products } from "@/lib/data";
import { PageIntro } from "@/components/page-intro";
import { ContactBanner } from "@/components/site-footer";
export function generateStaticParams(){return products.map(({slug})=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const product=products.find(p=>p.slug===slug);return{title:product?.name || "Product not found",description:product?.short};}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params;const product=products.find(p=>p.slug===slug);if(!product)notFound();
 return <><PageIntro eyebrow={`${product.category} refractories`} title={product.name} description={product.short}/><section className="section-pad"><div className="container"><div className="product-detail"><div className="product-detail-image"><Image src={product.image} alt="Refractory production and materials at Asfour" fill sizes="(max-width:600px) 100vw, 50vw" /></div><div><h2>THE MATERIAL.<br />THE POSSIBILITIES.</h2><p>{product.description}</p><h3>Available grades & ranges</h3><div className="grade-list">{product.grades.map(g=><span key={g}>{g}</span>)}</div><div className="product-actions"><Link href={`/contact?product=${encodeURIComponent(product.name)}`} className="button button-blue">Enquire about this product <ArrowUpRight size={18}/></Link>{product.datasheet && <a href={product.datasheet.url} target="_blank" rel="noopener noreferrer" className="button button-outline" aria-label={`${product.datasheet.label} (PDF, opens in a new tab)`}>Technical datasheet <FileDown size={18}/></a>}</div><p className="technical-note">Ask our team for current specifications, availability, and guidance on the right grade for your process.</p><Link href="/products" className="text-link"><ArrowLeft size={16}/> All products</Link></div></div></div></section><ContactBanner/></>;
}
