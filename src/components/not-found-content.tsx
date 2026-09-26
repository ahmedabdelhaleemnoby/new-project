import Link from "next/link";
import { ArrowRight } from "lucide-react";
export function NotFoundContent(){return <section className="not-found"><h1>404</h1><h2>THIS PAGE IS OUT OF RANGE.</h2><p>The page you’re looking for may have moved. Let’s get you back to our products.</p><Link className="button button-blue" href="/products">Explore products <ArrowRight size={18}/></Link></section>;}
