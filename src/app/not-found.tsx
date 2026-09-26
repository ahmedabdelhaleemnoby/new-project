import { NotFoundContent } from "@/components/not-found-content";
import { SiteShell } from "@/components/site-shell";

// Unmatched URLs render outside the (site) group, so wrap them in the site chrome here.
export default function NotFound() {
  return <SiteShell><NotFoundContent /></SiteShell>;
}
