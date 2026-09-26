// Types and labels shared by the admin server code and admin Client Components.
import type { EnquiryType } from "@/lib/enquiry";

export type WorkflowStatus = "new" | "in_progress" | "closed" | "spam";
export const workflowStatuses: WorkflowStatus[] = ["new", "in_progress", "closed", "spam"];
export const statusLabels: Record<WorkflowStatus, string> = { new: "New", in_progress: "In progress", closed: "Closed", spam: "Spam" };
export const typeLabels: Record<EnquiryType, string> = { sales: "Sales", technical: "Technical", career: "Career" };

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
