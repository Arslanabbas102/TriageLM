import React from 'react';
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Inbox, CheckCircle2, AlertTriangle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulatedUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
}

const ROLE_STYLE: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  manager: "bg-info/10 text-info border-info/20",
  customer: "bg-success/10 text-success border-success/20",
};

const UserProfile: React.FC<{ currentUser: SimulatedUser }> = ({ currentUser }) => {
  const { data: stats, isLoading } = useDashboardStats(currentUser.user_id);

  return (
    <AppShell title="My profile" description="Your account details and complaint history">
      <div className="surface p-6 shadow-card">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
              {currentUser.name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight">{currentUser.name}</h2>
            <p className="text-muted-foreground">{currentUser.email}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("capitalize", ROLE_STYLE[currentUser.role])}>
                {currentUser.role}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">{currentUser.user_id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={stats?.total ?? 0} icon={Inbox} tone="primary" loading={isLoading} />
        <StatCard label="Resolved" value={stats?.resolved ?? 0} icon={CheckCircle2} tone="success" loading={isLoading} />
        <StatCard label="Open" value={stats?.open ?? 0} icon={AlertTriangle} tone="warning" loading={isLoading} />
        <StatCard
          label="Avg. satisfaction"
          value={stats?.avgSatisfaction != null ? `${stats.avgSatisfaction.toFixed(1)}/5` : "—"}
          icon={Star}
          tone="info"
          loading={isLoading}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="surface p-5 shadow-card">
          <h3 className="font-semibold">Personal information</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Read-only in this demo — these are simulated profiles.
          </p>
          <div className="mt-5 space-y-4">
            {[
              { label: "Full name", value: currentUser.name },
              { label: "Email address", value: currentUser.email },
              { label: "User ID", value: currentUser.user_id },
              { label: "Role", value: currentUser.role },
            ].map((f) => (
              <div key={f.label} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{f.label}</Label>
                <Input value={f.value} readOnly className="bg-muted/50 capitalize" />
              </div>
            ))}
          </div>
        </div>

        <div className="surface p-5 shadow-card">
          <h3 className="font-semibold">Complaint breakdown</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">How your cases are distributed</p>
          {isLoading ? (
            <Skeleton className="mt-5 h-40 w-full" />
          ) : stats?.total ? (
            <div className="mt-5 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Resolution rate</span>
                  <span className="font-semibold">{stats.resolutionRate}%</span>
                </div>
                <Progress value={stats.resolutionRate} />
              </div>
              <dl className="space-y-3">
                {stats.byCategory.map((c) => (
                  <div key={c.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <dt className="truncate text-muted-foreground">{c.name}</dt>
                      <dd className="ml-3 font-medium">{c.value}</dd>
                    </div>
                    <Progress value={(c.value / stats.total) * 100} className="h-1.5" />
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              No complaints on record yet.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default UserProfile;
