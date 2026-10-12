import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Complaint, ComplaintStatus } from "@/types/complaint";

export interface ComplaintFilters {
  search: string;
  status: string;
  priority: string;
  category: string;
  channel: string;
  sort: string; // "<column>.<asc|desc>"
  page: number;
  pageSize: number;
  userId?: string; // scope to one customer
}

export const DEFAULT_FILTERS: ComplaintFilters = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  channel: "all",
  sort: "created_at.desc",
  page: 1,
  pageSize: 10,
};

/**
 * Filtering, sorting and pagination all run in Postgres rather than in the
 * browser, so the client only ever holds one page of rows.
 */
function buildQuery(f: ComplaintFilters, opts: { countOnly?: boolean } = {}) {
  let q = supabase
    .from("complaints")
    .select("*", { count: "exact", head: opts.countOnly });

  if (f.userId) q = q.eq("user_id", f.userId);
  if (f.status !== "all") q = q.eq("status", f.status);
  if (f.priority !== "all") q = q.eq("priority", f.priority);
  if (f.category !== "all") q = q.eq("category", f.category);
  if (f.channel !== "all") q = q.eq("channel", f.channel);

  const term = f.search.trim();
  if (term) {
    const safe = term.replace(/[%,()]/g, "");
    q = q.or(
      [
        `title.ilike.%${safe}%`,
        `description.ilike.%${safe}%`,
        `customer_name.ilike.%${safe}%`,
        `reference.ilike.%${safe}%`,
        `order_number.ilike.%${safe}%`,
        `category.ilike.%${safe}%`,
      ].join(",")
    );
  }
  return q;
}

export function useComplaints(filters: ComplaintFilters) {
  return useQuery({
    queryKey: ["complaints", filters],
    queryFn: async () => {
      const [column, direction] = filters.sort.split(".");
      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;

      const { data, error, count } = await buildQuery(filters)
        .order(column, { ascending: direction === "asc" })
        .range(from, to);

      if (error) throw error;
      return { rows: (data ?? []) as Complaint[], total: count ?? 0 };
    },
    placeholderData: (prev) => prev, // keeps the table steady while paging
  });
}

/** Every matching row, ignoring pagination — used for CSV export. */
export async function fetchAllComplaints(filters: ComplaintFilters) {
  const [column, direction] = filters.sort.split(".");
  const { data, error } = await buildQuery(filters).order(column, {
    ascending: direction === "asc",
  });
  if (error) throw error;
  return (data ?? []) as Complaint[];
}

export function useComplaintOptions() {
  return useQuery({
    queryKey: ["complaint-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("category,channel");
      if (error) throw error;
      const rows = (data ?? []) as { category: string; channel: string }[];
      return {
        categories: [...new Set(rows.map((r) => r.category))].sort(),
        channels: [...new Set(rows.map((r) => r.channel))].sort(),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateComplaintStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ComplaintStatus }) => {
      const { error } = await supabase
        .from("complaints")
        .update({
          status,
          resolved_at: status === "resolved" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      qc.invalidateQueries({ queryKey: ["complaint-stats"] });
    },
  });
}

export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Complaint>) => {
      const { data, error } = await supabase
        .from("complaints")
        .insert([{ ...input, reference: `COM-${Date.now().toString().slice(-6)}` }])
        .select()
        .single();
      if (error) throw error;
      return data as Complaint;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      qc.invalidateQueries({ queryKey: ["complaint-stats"] });
    },
  });
}
