"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SELECTOR = "[data-reveal]:not(.is-visible),[data-stagger]:not(.is-visible),[data-wipe]:not(.is-visible)";

/** Adds `is-visible` to [data-reveal], [data-stagger] and [data-wipe] elements as they scroll into view (styles in motion.css). */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = [...document.querySelectorAll<HTMLElement>(SELECTOR)];
    elements.forEach(el => {
      if (el.hasAttribute("data-stagger")) [...el.children].forEach((child, i) => (child as HTMLElement).style.setProperty("--i", String(i)));
    });
    if (reduced || !("IntersectionObserver" in window)) {
      elements.forEach(el => el.classList.add("is-visible"));
      return;
    }
    root.classList.add("motion");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}

/** Scroll progress bar, driven by CSS scroll timelines where supported. */
export function ScrollProgress() {
  return <div className="scroll-progress" aria-hidden="true" />;
}
