"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
const slides = [
  { image: "/images/hero.jpg", label: "ENGINEERED TO ENDURE. SINCE 1982.", title: <>BUILT FOR<br />THE EXTREME.</>, text: "Refractory solutions that keep your industry moving. From the heart of Egypt to the world’s most demanding environments.", caption: "THE ASFOUR PRODUCTION FACILITY · HELWAN, EGYPT" },
  { image: "/images/production.jpg", label: "MATERIAL EXPERTISE. INDUSTRIAL STRENGTH.", title: <>PRECISION IN<br />EVERY PRODUCT.</>, text: "Shaped and unshaped refractories. A wide range of materials, with the expertise to find the right fit for your process.", caption: "REFRACTORY MANUFACTURING · ASFOUR M&R" },
  { image: "/images/bricks.jpg", label: "ROOTED IN EGYPT. REACHING FURTHER.", title: <>LOCAL ROOTS.<br />GLOBAL REACH.</>, text: "Supporting industries across more than 30 countries with refractory materials and a commitment to long-term partnerships.", caption: "PREPARING FOR DELIVERY · ASFOUR M&R" },
];
export function Hero() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  return <section className="hero" aria-roledescription="carousel" aria-label="Asfour highlights"><div className="hero-image"><Image key={slide.image} src={slide.image} alt="Inside the Asfour refractory manufacturing facility in Egypt" fill sizes="100vw" priority /></div><div className="hero-shade" /><div className="container hero-inner"><div className="hero-content" key={index}><p className="eyebrow"><span className="small-square" />{slide.label}</p><h1>{slide.title}</h1><p className="hero-description">{slide.text}</p><div className="hero-actions"><Link className="button button-blue" href="/products">Explore our products <ArrowUpRight size={19} /></Link><Link className="button button-glass" href="/about">Discover Asfour <ArrowRight size={19} /></Link></div></div><div className="hero-bottom"><a href="#introduction" className="scroll-link"><ArrowDown size={17} /><span>SCROLL TO EXPLORE</span></a><div className="slide-controls"><span aria-live="polite"><b>0{index + 1}</b> / 03</span><button aria-label="Previous highlight" onClick={() => setIndex((index + 2) % 3)}><ArrowLeft size={19} /></button><button aria-label="Next highlight" onClick={() => setIndex((index + 1) % 3)}><ArrowRight size={19} /></button></div></div></div><span className="hero-photo-caption">{slide.caption}</span></section>;
}
