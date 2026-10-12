import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Complaint } from "@/types/complaint";

export interface DashboardStats {
  total: number;
  open: number;
  resolved: number;
  escalated: number;
  resolutionRate: number;
  avgResolutionDays: number | null;
  avgSatisfaction: number | null;
  userCount: number;
  byStatus: { name: string; value: number }[];
  byCategory: { name: string; value: number }[];
  byPriority: { name: string; value: number }[];
  trend: { date: string; received: number; resolved: number }[];
}

/**
 * One pass over the complaint rows produces every figure the dashboards show,
 * so a dashboard costs two requests rather than one per tile.
 */
export function useDashboardStats(userId?: string) {
  return useQuery({
    queryKey: ["complaint-stats", userId ?? "all"],
    queryFn: async (): Promise<DashboardStats> => {
      let q = supabase
        .from("complaints")
        .select("status,priority,category,created_at,resolved_at,satisfaction_rating");
      if (userId) q = q.eq("user_id", userId);

      // A plain select rather than a head+count request: the table is tiny, and
      // HEAD requests surface as spurious ERR_ABORTED entries in devtools.
      const [{ data, error }, usersRes] = await Promise.all([
        q,
        supabase.from("simulated_users").select("id"),
      ]);
      if (error) throw error;

      const rows = (data ?? []) as Pick<
        Complaint,
        "status" | "priority" | "category" | "created_at" | "resolved_at" | "satisfaction_rating"
      >[];

      const total = rows.length;
      const resolved = rows.filter((r) => r.status === "resolved").length;
      const escalated = rows.filter((r) => r.status === "escalated").length;
      const open = total - resolved;

      const resolvedRows = rows.filter((r) => r.resolved_at);
      const avgResolutionDays = resolvedRows.length
        ? resolvedRows.reduce((acc, r) => {
            const ms = new Date(r.resolved_at!).getTime() - new Date(r.created_at).getTime();
            return acc + ms / 86_400_000;
          }, 0) / resolvedRows.length
        : null;

      const rated = rows.filter((r) => typeof r.satisfaction_rating === "number");
      const avgSatisfaction = rated.length
        ? rated.reduce((a, r) => a + (r.satisfaction_rating as number), 0) / rated.length
        : null;

      const tally = (key: "status" | "category" | "priority") => {
        const m = new Map<string, number>();
        rows.forEach((r) => m.set(r[key], (m.get(r[key]) ?? 0) + 1));
        return [...m.entries()]
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
      };

      // Last 8 weeks, bucketed weekly.
      const trend: DashboardStats["trend"] = [];
      const now = Date.now();
      for (let w = 7; w >= 0; w--) {
        const start = now - (w + 1) * 7 * 86_400_000;
        const end = now - w * 7 * 86_400_000;
        trend.push({
          date: new Date(end).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          received: rows.filter((r) => {
            const t = new Date(r.created_at).getTime();
            return t >= start && t < end;
          }).length,
          resolved: rows.filter((r) => {
            if (!r.resolved_at) return false;
            const t = new Date(r.resolved_at).getTime();
            return t >= start && t < end;
          }).length,
        });
      }

      return {
        total,
        open,
        resolved,
        escalated,
        resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
        avgResolutionDays,
        avgSatisfaction,
        userCount: usersRes.data?.length ?? 0,
        byStatus: tally("status"),
        byCategory: tally("category"),
        byPriority: tally("priority"),
        trend,
      };
    },
    staleTime: 60 * 1000,
  });
}
