import { lang } from "next/root-params";
import { hasLocale } from "@/i18n/config";
import { NotFoundContent } from "@/components/not-found-content";

export default async function NotFound() {
  const value = await lang();
  return <NotFoundContent lang={value && hasLocale(value) ? value : "en"} />;
}
