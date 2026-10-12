import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useComplaints, DEFAULT_FILTERS } from "@/hooks/useComplaints";
import { STATUS_CLASS, STATUS_LABEL, PRIORITY_CLASS } from "@/types/complaint";
import { Inbox, AlertTriangle, CheckCircle2, Timer, ArrowRight, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const ManagerDashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();

  // The queue that actually needs attention: escalated first, then newest.
  const { data: urgent, isLoading: loadingUrgent } = useComplaints({
    ...DEFAULT_FILTERS,
    status: "escalated",
    pageSize: 5,
  });
  const { data: incoming, isLoading: loadingIncoming } = useComplaints({
    ...DEFAULT_FILTERS,
    status: "new",
    pageSize: 5,
  });

  return (
    <AppShell title="Manager dashboard" description="Team performance and complaint resolution">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={stats?.total ?? 0} icon={Inbox} tone="primary" loading={isLoading} />
        <StatCard label="Open" value={stats?.open ?? 0} hint={`${stats?.escalated ?? 0} escalated`} icon={AlertTriangle} tone="warning" loading={isLoading} />
        <StatCard label="Resolved" value={stats?.resolved ?? 0} hint={`${stats?.resolutionRate ?? 0}% resolution rate`} icon={CheckCircle2} tone="success" loading={isLoading} />
        <StatCard
          label="Avg. resolution time"
          value={stats?.avgResolutionDays != null ? `${stats.avgResolutionDays.toFixed(1)}d` : "—"}
          icon={Timer}
          tone="info"
          loading={isLoading}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="surface p-5 shadow-card lg:col-span-1">
          <h3 className="font-semibold">Resolution rate</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Share of complaints closed</p>
          {isLoading ? (
            <Skeleton className="mt-6 h-24 w-full" />
          ) : (
            <>
              <p className="mt-6 text-4xl font-bold">{stats?.resolutionRate ?? 0}%</p>
              <Progress value={stats?.resolutionRate ?? 0} className="mt-4" />
              <dl className="mt-6 space-y-2.5 text-sm">
                {stats?.byStatus.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <dt>
                      <Badge variant="outline" className={cn("capitalize", STATUS_CLASS[s.name as keyof typeof STATUS_CLASS])}>
                        {STATUS_LABEL[s.name as keyof typeof STATUS_LABEL] ?? s.name}
                      </Badge>
                    </dt>
                    <dd className="font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>

        <div className="surface shadow-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="flex items-center gap-1.5 font-semibold">
                <Flame className="h-4 w-4 text-destructive" /> Needs attention
              </h3>
              <p className="text-xs text-muted-foreground">Escalated and newly received</p>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/user/complaints">Open queue <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {loadingUrgent || loadingIncoming ? (
              Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="px-5 py-4"><Skeleton className="h-10 w-full" /></li>
              ))
            ) : (
              [...(urgent?.rows ?? []), ...(incoming?.rows ?? [])].slice(0, 6).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {c.reference} · {c.customer_name}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Badge variant="outline" className={cn("hidden capitalize sm:inline-flex", PRIORITY_CLASS[c.priority])}>
                      {c.priority}
                    </Badge>
                    <Badge variant="outline" className={STATUS_CLASS[c.status]}>
                      {STATUS_LABEL[c.status]}
                    </Badge>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="mt-4">
        <DashboardAnalytics stats={stats} loading={isLoading} />
      </div>
    </AppShell>
  );
};

export default ManagerDashboard;
