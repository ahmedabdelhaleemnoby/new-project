import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";
const manrope = localFont({ src: [{path: "../../public/fonts/manrope-400.ttf", weight: "400"}, {path: "../../public/fonts/manrope-500.ttf", weight: "500"}, {path: "../../public/fonts/manrope-600.ttf", weight: "600"}, {path: "../../public/fonts/manrope-700.ttf", weight: "700"}], variable: "--font-body", display: "swap" });
const barlow = localFont({ src: [{path: "../../public/fonts/barlow-condensed-500.ttf", weight: "500"}, {path: "../../public/fonts/barlow-condensed-600.ttf", weight: "600"}, {path: "../../public/fonts/barlow-condensed-700.ttf", weight: "700"}], variable: "--font-display", display: "swap" });
export const metadata: Metadata = { title: { default: "Asfour M&R — Built for the Extreme", template: "%s | Asfour M&R" }, description: "Explore Asfour's refractory products, industrial solutions, and manufacturing expertise. Shaped and unshaped refractories, made in Egypt since 1982.", robots: {index: false, follow: false} };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en" className={`${manrope.variable} ${barlow.variable}`}><body id="top"><a className="skip-link" href="#main">Skip to content</a><SiteHeader /><main id="main">{children}</main><SiteFooter /></body></html>;
}
