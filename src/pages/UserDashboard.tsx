import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useComplaints, DEFAULT_FILTERS } from "@/hooks/useComplaints";
import { STATUS_CLASS, STATUS_LABEL } from "@/types/complaint";
import { Inbox, CheckCircle2, AlertTriangle, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulatedUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
}

const UserDashboard = ({ currentUser }: { currentUser: SimulatedUser }) => {
  const { data: stats, isLoading } = useDashboardStats(currentUser.user_id);
  const { data: recent, isLoading: loadingRecent } = useComplaints({
    ...DEFAULT_FILTERS,
    pageSize: 5,
    userId: currentUser.user_id,
  });

  return (
    <AppShell title="My dashboard" description={`Complaint overview for ${currentUser.name}`}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={stats?.total ?? 0} icon={Inbox} tone="primary" loading={isLoading} />
        <StatCard label="Open" value={stats?.open ?? 0} icon={AlertTriangle} tone="warning" loading={isLoading} />
        <StatCard label="Resolved" value={stats?.resolved ?? 0} hint={`${stats?.resolutionRate ?? 0}% resolution rate`} icon={CheckCircle2} tone="success" loading={isLoading} />
        <StatCard
          label="Avg. satisfaction"
          value={stats?.avgSatisfaction != null ? `${stats.avgSatisfaction.toFixed(1)}/5` : "—"}
          icon={Star}
          tone="info"
          loading={isLoading}
        />
      </div>

      <div className="surface mt-4 shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="font-semibold">Recent complaints</h3>
            <p className="text-xs text-muted-foreground">Your five most recent cases</p>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/user/complaints">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {loadingRecent ? (
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="px-5 py-4"><Skeleton className="h-10 w-full" /></li>
            ))
          ) : recent?.rows.length ? (
            recent.rows.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {c.reference} · {c.category} · {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className={cn("shrink-0", STATUS_CLASS[c.status])}>
                  {STATUS_LABEL[c.status]}
                </Badge>
              </li>
            ))
          ) : (
            <li className="px-5 py-12 text-center text-sm text-muted-foreground">
              No complaints yet.
            </li>
          )}
        </ul>
      </div>

      <div className="mt-4">
        <DashboardAnalytics stats={stats} loading={isLoading} />
      </div>
    </AppShell>
  );
};

export default UserDashboard;
