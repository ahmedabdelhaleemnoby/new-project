"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

// TODO: replace these placeholder photos with Ajyad's own photography.
const images = ["/images/hero.jpg", "/images/production.jpg", "/images/about.jpg"];
const SLIDE_MS = 7000;

export function Hero({ lang, t }: { lang: Locale; t: Dictionary["hero"] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [introActive, setIntroActive] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const slide = t.slides[index];
  const count = t.slides.length;

  // Autoplay only without reduced motion, and pauses while the pointer or keyboard focus is in the hero.
  useEffect(() => { setAutoplay(!window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  // Hold autoplay while the first-visit intro covers the page (it sets `intro-lock` on <html>).
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIntroActive(root.classList.contains("intro-lock"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!autoplay || paused || introActive) return;
    const timer = window.setTimeout(() => setIndex(i => (i + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [autoplay, paused, introActive, index, count]);

  return <section ref={sectionRef} className="hero" aria-roledescription="carousel" aria-label={t.carousel}
    onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
    onFocus={() => setPaused(true)} onBlur={event => { if (!sectionRef.current?.contains(event.relatedTarget as Node)) setPaused(false); }}>
    <div className="hero-image"><Image key={images[index]} src={images[index]} alt={t.imageAlt} fill sizes="100vw" priority /></div>
    <div className="hero-shade" />
    <div className="container hero-inner">
      <div className="hero-content" key={index}>
        <p className="eyebrow"><span className="small-square" />{slide.label}</p>
        <h1><span className="line"><span>{slide.title[0]}</span></span><span className="line"><span>{slide.title[1]}</span></span></h1>
        <p className="hero-description">{slide.text}</p>
        <div className="hero-actions"><Link className="button button-blue" href={localePath(lang, "/products")}>{t.explore} <ArrowUpRight size={19} /></Link><Link className="button button-glass" href={localePath(lang, "/about")}>{t.discover} <ArrowRight size={19} /></Link></div>
      </div>
      <div className="hero-bottom">
        <a href="#introduction" className="scroll-link"><ArrowDown size={17} /><span>{t.scroll}</span></a>
        <div className="slide-controls">
          <span aria-live={autoplay && !paused ? "off" : "polite"}><span dir="ltr"><b>0{index + 1}</b> / 0{count}</span>{autoplay && <span className="slide-progress" aria-hidden="true"><i key={index} style={{ animationPlayState: paused || introActive ? "paused" : "running", ["--slide-ms" as string]: `${SLIDE_MS}ms` }} /></span>}</span>
          <button aria-label={t.previous} onClick={() => setIndex((index + count - 1) % count)}><ArrowLeft size={19} /></button>
          <button aria-label={t.next} onClick={() => setIndex((index + 1) % count)}><ArrowRight size={19} /></button>
        </div>
      </div>
    </div>
  </section>;
}
