export type ComplaintStatus = "new" | "in-progress" | "resolved" | "escalated";
export type ComplaintPriority = "low" | "medium" | "high" | "critical";

export interface Complaint {
  id: string;
  reference: string;
  user_id: string;
  customer_name: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  category: string;
  channel: string;
  order_number: string | null;
  ai_is_actionable: boolean | null;
  ai_info_complete: boolean | null;
  ai_category: string | null;
  ai_resolution: string | null;
  satisfaction_rating: number | null;
  created_at: string;
  resolved_at: string | null;
}

export const STATUSES: ComplaintStatus[] = ["new", "in-progress", "resolved", "escalated"];
export const PRIORITIES: ComplaintPriority[] = ["low", "medium", "high", "critical"];

export const STATUS_LABEL: Record<ComplaintStatus, string> = {
  new: "New",
  "in-progress": "In progress",
  resolved: "Resolved",
  escalated: "Escalated",
};

/** Token-based classes so badges stay legible in both themes. */
export const STATUS_CLASS: Record<ComplaintStatus, string> = {
  new: "bg-info/10 text-info border-info/20",
  "in-progress": "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-success/10 text-success border-success/20",
  escalated: "bg-destructive/10 text-destructive border-destructive/20",
};

export const PRIORITY_CLASS: Record<ComplaintPriority, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-info/10 text-info border-info/20",
  high: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};
