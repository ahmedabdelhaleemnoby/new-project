import { revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/content";

// Lets the backend refresh the site's content cache after changes made outside the dashboard
// (docs/BACKEND_CMS_SPEC.md §6). Disabled unless REVALIDATE_SECRET is set.
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) return Response.json({ error: "Unauthorized" }, { status: 401 });
  revalidateTag(CONTENT_TAG, "max");
  return Response.json({ revalidated: true });
}
