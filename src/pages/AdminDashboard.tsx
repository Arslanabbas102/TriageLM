import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateUserDialog } from "@/components/CreateUserDialog";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { fetchAllComplaints, DEFAULT_FILTERS } from "@/hooks/useComplaints";
import { toCsv, downloadCsv } from "@/lib/export-csv";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Inbox, CheckCircle2, AlertTriangle, Download, Database, Cpu, Shield, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulatedUser {
  id: string; user_id: string; name: string; email: string; role: string;
}

const ROLE_STYLE: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  manager: "bg-info/10 text-info border-info/20",
  customer: "bg-success/10 text-success border-success/20",
};

const AdminDashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("simulated_users").select("*").order("role");
      if (error) throw error;
      return data as SimulatedUser[];
    },
  });

  // Per-user complaint counts, derived once for the user table.
  const { data: perUser } = useQuery({
    queryKey: ["admin-per-user"],
    queryFn: async () => {
      const { data, error } = await supabase.from("complaints").select("user_id,status");
      if (error) throw error;
      const m = new Map<string, { total: number; open: number }>();
      (data ?? []).forEach((r: { user_id: string; status: string }) => {
        const cur = m.get(r.user_id) ?? { total: 0, open: 0 };
        cur.total += 1;
        if (r.status !== "resolved") cur.open += 1;
        m.set(r.user_id, cur);
      });
      return m;
    },
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const all = await fetchAllComplaints(DEFAULT_FILTERS);
      downloadCsv(
        `all-complaints-${new Date().toISOString().slice(0, 10)}.csv`,
        toCsv(all, [
          { key: "reference", label: "Reference" },
          { key: "title", label: "Title" },
          { key: "customer_name", label: "Customer" },
          { key: "status", label: "Status" },
          { key: "priority", label: "Priority" },
          { key: "category", label: "Category" },
          { key: "channel", label: "Channel" },
          { key: "created_at", label: "Created" },
          { key: "resolved_at", label: "Resolved" },
        ])
      );
      toast({ title: "Export ready", description: `${all.length} complaints downloaded.` });
    } catch (e) {
      toast({ title: "Export failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppShell
      title="Admin dashboard"
      description="System administration and analytics"
      actions={
        <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting} className="gap-1.5">
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">Export all</span>
        </Button>
      }
    >
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Registered users" value={stats?.userCount ?? 0} icon={Users} tone="primary" loading={isLoading} />
            <StatCard label="Total complaints" value={stats?.total ?? 0} icon={Inbox} tone="info" loading={isLoading} />
            <StatCard label="Resolved" value={stats?.resolved ?? 0} hint={`${stats?.resolutionRate ?? 0}% resolution rate`} icon={CheckCircle2} tone="success" loading={isLoading} />
            <StatCard label="Escalated" value={stats?.escalated ?? 0} icon={AlertTriangle} tone="destructive" loading={isLoading} />
          </div>
          <DashboardAnalytics stats={stats} loading={isLoading} />
        </TabsContent>

        <TabsContent value="users" className="mt-5">
          <div className="surface overflow-hidden shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h3 className="font-semibold">User management</h3>
                <p className="text-xs text-muted-foreground">All simulated users and their complaint load</p>
              </div>
              <CreateUserDialog />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>User</TableHead>
                    <TableHead className="hidden sm:table-cell">User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Complaints</TableHead>
                    <TableHead className="text-right">Open</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingUsers
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 5 }).map((__, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    : users?.map((u) => {
                        const counts = perUser?.get(u.user_id);
                        return (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                    {u.name.split(" ").map((n) => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">{u.name}</p>
                                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">{u.user_id}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn("capitalize", ROLE_STYLE[u.role])}>{u.role}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">{counts?.total ?? 0}</TableCell>
                            <TableCell className="text-right">
                              {counts?.open ? (
                                <span className="font-medium text-warning">{counts.open}</span>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-5">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Cpu, title: "Classification model", value: "Gemma 3-270M", hint: "Fine-tuned, 4 prediction heads" },
              { icon: Database, title: "Database", value: "Supabase Postgres", hint: `${stats?.total ?? 0} complaint rows` },
              { icon: Shield, title: "Access control", value: "Role-simulated", hint: "Customer · Manager · Admin" },
            ].map((s) => (
              <div key={s.title} className="surface p-5 shadow-card">
                <span className="inline-grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm text-muted-foreground">{s.title}</h3>
                <p className="mt-1 text-lg font-semibold">{s.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>
              </div>
            ))}
          </div>

          <div className="surface mt-4 p-5 shadow-card">
            <h3 className="font-semibold">Model tasks</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Four predictions produced per complaint in a single pass
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["is_actionable", "Can this be acted on?"],
                ["info_complete", "Is enough detail present?"],
                ["complaint_category", "What kind of problem?"],
                ["resolution_recommendation", "What should happen next?"],
              ].map(([name, desc]) => (
                <div key={name} className="rounded-lg border border-border bg-muted/40 p-3.5">
                  <p className="font-mono text-xs font-medium text-primary">{name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
};

export default AdminDashboard;
