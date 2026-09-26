import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { ProductCatalogue } from "@/components/product-explorer";
import { ContactBanner } from "@/components/site-footer";
import { getProducts } from "@/lib/content";
export const metadata: Metadata = {title: "Refractory products"};
export default async function ProductsPage({searchParams}:{searchParams:Promise<{category?:string}>}) {
 const [{category}, products]=await Promise.all([searchParams, getProducts()]);
 return <><PageIntro eyebrow="Our products" title="Materials made for the challenge." description="Explore shaped and unshaped refractory products. Find a family, search a grade, or speak to our team about your specific requirements." /><section className="section-pad"><div className="container"><ProductCatalogue key={category} products={products} initialCategory={category}/></div></section><ContactBanner /></>;
}
