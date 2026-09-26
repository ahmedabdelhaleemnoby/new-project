import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getProductMenu, getSectorMenu } from "@/lib/content";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [productMenu, sectorMenu] = await Promise.all([getProductMenu(), getSectorMenu()]);
  return <><a className="skip-link" href="#main">Skip to content</a><SiteHeader productMenu={productMenu} sectorMenu={sectorMenu} /><main id="main">{children}</main><SiteFooter /></>;
}
