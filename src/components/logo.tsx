import Image from "next/image";

// Rendered from the supplied AJYAD LOOG.eps (black artwork), coloured to match the brand mockup.
export function Logo({ alt, className = "", priority = false }: { alt: string; className?: string; priority?: boolean }) {
  return <Image src="/images/ajyad-logo.png" alt={alt} width={2400} height={737} className={`logo ${className}`} sizes="220px" priority={priority} />;
}
