// Types shared by the admin server code and admin Client Components. Labels live in the dictionaries.
import type { EnquiryType } from "@/lib/enquiry";

export type WorkflowStatus = "new" | "in_progress" | "closed" | "spam";
export const workflowStatuses: WorkflowStatus[] = ["new", "in_progress", "closed", "spam"];

export type Staff = { name: string; email: string; role: string };
export type Enquiry = {
  /** Required to open an enquiry; the published API schema does not list it yet. */
  id?: number;
  reference: string; type: EnquiryType; name: string; email: string; company: string | null; phone: string | null;
  product_slug: string | null; topic: string | null; message: string; workflow_status: WorkflowStatus; assigned_to: number | null;
  created_at: string | null; updated_at: string | null;
};
export type NotificationJob = {
  id: number; enquiry_id: number; recipient_group: string; status: string; attempt_count: number; max_attempts: number;
  next_attempt_at: string | null; provider_message_id: string | null; last_error: string | null; created_at: string | null; updated_at: string | null;
};
export type PageMeta = { current_page: number; per_page: number; total: number; last_page: number };

// ---- Content management (docs/BACKEND_CMS_SPEC.md §3) ----
export type Bilingual = { en: string; ar: string };
export type StaffRole = "admin" | "editor" | "sales" | "hr";
export const staffRoles: StaffRole[] = ["admin", "editor", "sales", "hr"];
export const industryIcons = ["steel", "cement", "glass", "aluminium", "chemical", "power"] as const;
export type IndustryIcon = (typeof industryIcons)[number];

export type DatasheetGroup = { name: Bilingual | null; sheets: { label: string; url: string }[] };
export type AdminProduct = {
  id: number; slug: string; category: "Shaped" | "Unshaped"; sort_order: number; published: boolean; image: string;
  name: Bilingual; short: Bilingual; description: Bilingual; grades: string[];
  featured_datasheet: { label: Bilingual; url: string } | null; datasheet_groups: DatasheetGroup[];
  /** Optional (spec §3.1): applications and the technical data table. */
  applications?: Bilingual[];
  specs?: { title: string; sections: { name: Bilingual; rows: { label: Bilingual; value: Bilingual }[] }[] } | null;
  created_at?: string | null; updated_at?: string | null;
};
export type AdminIndustry = {
  id: number; slug: string; icon: IndustryIcon; sort_order: number; published: boolean;
  name: Bilingual; text: Bilingual; brochure_url: string | null; updated_at?: string | null;
};
export type AdminSettings = {
  name: Bilingual; full_name: Bilingual; email: string;
  secondary_email: { email: string; label: Bilingual } | null; phone: string | null;
  address: { en: string[]; ar: string[]; map_url: string } | null;
  legal: { form: Bilingual; commercial_register: string; tax_card: string };
  images: Record<string, string | null>;
};
export type MediaItem = { id: number; url: string; filename: string; mime: string; size: number; width: number | null; height: number | null; alt?: Bilingual; created_at?: string | null };
export type StaffMember = { id: number; name: string; email: string; role: StaffRole; active: boolean; last_login_at?: string | null };

/** Which dashboard sections each role sees (the backend enforces the same rules). */
export const roleSections: Record<StaffRole, string[]> = {
  admin: ["enquiries", "products", "sectors", "content", "media", "settings", "staff"],
  editor: ["products", "sectors", "content", "media", "settings"],
  sales: ["enquiries"],
  hr: ["enquiries"],
};
