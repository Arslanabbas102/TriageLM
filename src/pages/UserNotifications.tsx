import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, CheckCircle2, AlertTriangle, Clock, Inbox } from "lucide-react";
import type { Complaint } from "@/types/complaint";
import { cn } from "@/lib/utils";

type NotificationKind = "resolved" | "escalated" | "progress" | "received";

const KIND: Record<NotificationKind, { icon: typeof Bell; label: string; cls: string }> = {
  resolved:  { icon: CheckCircle2,  label: "Resolved",    cls: "bg-success/10 text-success" },
  escalated: { icon: AlertTriangle, label: "Escalated",   cls: "bg-destructive/10 text-destructive" },
  progress:  { icon: Clock,         label: "In progress", cls: "bg-warning/10 text-warning" },
  received:  { icon: Inbox,         label: "Received",    cls: "bg-info/10 text-info" },
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

/** Notifications are derived from complaint activity rather than stored separately. */
const UserNotifications = () => {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["user-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;

      return (data as Complaint[]).map((c) => {
        const kind: NotificationKind =
          c.status === "resolved" ? "resolved"
          : c.status === "escalated" ? "escalated"
          : c.status === "in-progress" ? "progress"
          : "received";

        const message =
          kind === "resolved"
            ? `Resolved with "${c.ai_resolution ?? "a resolution"}".`
            : kind === "escalated"
            ? "Escalated to a specialist for review."
            : kind === "progress"
            ? "An agent is working on this complaint."
            : `Received and classified as "${c.ai_category ?? c.category}".`;

        return {
          id: c.id,
          kind,
          title: c.title,
          reference: c.reference,
          message,
          time: relativeTime(c.resolved_at ?? c.created_at),
          unread: c.status === "new" || c.status === "escalated",
        };
      });
    },
  });

  const unread = notifications.filter((n) => n.unread).length;

  return (
    <AppShell
      title="Notifications"
      description="Activity across your complaints"
      actions={
        unread > 0 ? (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {unread} unread
          </Badge>
        ) : null
      }
    >
      <div className="surface overflow-hidden shadow-card">
        {isLoading ? (
          <ul className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex gap-3 px-5 py-4">
                <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </li>
            ))}
          </ul>
        ) : notifications.length === 0 ? (
          <div className="px-5 py-20 text-center">
            <Bell className="mx-auto h-9 w-9 text-muted-foreground/50" />
            <p className="mt-3 font-medium">You're all caught up</p>
            <p className="mt-1 text-sm text-muted-foreground">No notifications right now.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => {
              const meta = KIND[n.kind];
              return (
                <li
                  key={n.id}
                  className={cn(
                    "flex gap-3.5 px-5 py-4 transition-colors hover:bg-muted/40",
                    n.unread && "bg-primary/[0.03]"
                  )}
                >
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", meta.cls)}>
                    <meta.icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate text-sm font-medium">
                        {n.title}
                        {n.unread && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground/70">{n.reference}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
};

export default UserNotifications;
