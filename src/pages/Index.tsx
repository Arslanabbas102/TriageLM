import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatCard } from "@/components/StatCard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  MessageSquare, Users, BarChart3, Settings, LogOut, User, ShieldCheck,
  FileText, Bell, ArrowRight, Sparkles, CheckCircle2, AlertTriangle, Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulatedUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
}

interface IndexProps {
  currentUser: SimulatedUser;
  onLogout: () => void;
}

const ROLE_STYLE: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  manager: "bg-info/10 text-info border-info/20",
  customer: "bg-success/10 text-success border-success/20",
};

const Index = ({ currentUser, onLogout }: IndexProps) => {
  const isCustomer = currentUser.role === "customer";
  // Customers see only their own numbers; staff see the whole queue.
  const { data: stats, isLoading } = useDashboardStats(
    isCustomer ? currentUser.user_id : undefined
  );

  const roleIcon =
    currentUser.role === "admin" ? <ShieldCheck className="h-3 w-3" />
      : currentUser.role === "manager" ? <Settings className="h-3 w-3" />
      : <User className="h-3 w-3" />;

  const routes = [
    {
      title: "TriageLM Chat",
      description: "Talk to the AI complaint resolution assistant",
      icon: MessageSquare,
      href: "/chat",
      tone: "bg-primary/10 text-primary",
    },
    ...(currentUser.role === "customer"
      ? [
          { title: "My Dashboard", description: "Your complaint history and status", icon: BarChart3, href: "/user/dashboard", tone: "bg-success/10 text-success" },
          { title: "My Complaints", description: "Search, filter and export your complaints", icon: FileText, href: "/user/complaints", tone: "bg-info/10 text-info" },
          { title: "Notifications", description: "Updates on your open cases", icon: Bell, href: "/user/notifications", tone: "bg-warning/10 text-warning" },
          { title: "My Profile", description: "Manage your account details", icon: User, href: "/user/profile", tone: "bg-muted text-muted-foreground" },
        ]
      : []),
    ...(currentUser.role === "manager"
      ? [
          { title: "Manager Dashboard", description: "Team performance and resolution trends", icon: Users, href: "/manager/dashboard", tone: "bg-success/10 text-success" },
          { title: "All Complaints", description: "The full complaint queue", icon: FileText, href: "/user/complaints", tone: "bg-info/10 text-info" },
        ]
      : []),
    ...(currentUser.role === "admin"
      ? [
          { title: "Admin Dashboard", description: "Full system control and analytics", icon: ShieldCheck, href: "/admin/dashboard", tone: "bg-destructive/10 text-destructive" },
          { title: "All Complaints", description: "The full complaint queue", icon: FileText, href: "/user/complaints", tone: "bg-info/10 text-info" },
          { title: "Team View", description: "Manager-level reporting", icon: Users, href: "/manager/dashboard", tone: "bg-success/10 text-success" },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <span className="font-bold tracking-tight">TriageLM</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 sm:flex">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {currentUser.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <Badge variant="outline" className={cn("mt-0.5 h-4 gap-1 px-1.5 text-[10px] capitalize", ROLE_STYLE[currentUser.role])}>
                  {roleIcon}{currentUser.role}
                </Badge>
              </div>
            </div>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={onLogout} className="gap-1.5">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="page-gradient">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="animate-fade-up">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {currentUser.name.split(" ")[0]}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isCustomer
                ? "Here's where your complaints stand right now."
                : "Here's how the complaint queue is performing."}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={isCustomer ? "My complaints" : "Total complaints"} value={stats?.total ?? 0} icon={Inbox} tone="primary" loading={isLoading} />
            <StatCard label="Open" value={stats?.open ?? 0} icon={AlertTriangle} tone="warning" loading={isLoading} />
            <StatCard label="Resolved" value={stats?.resolved ?? 0} hint={`${stats?.resolutionRate ?? 0}% resolution rate`} icon={CheckCircle2} tone="success" loading={isLoading} />
            <StatCard
              label="Avg. resolution"
              value={stats?.avgResolutionDays != null ? `${stats.avgResolutionDays.toFixed(1)}d` : "—"}
              icon={BarChart3}
              tone="info"
              loading={isLoading}
            />
          </div>

          <h2 className="mt-12 text-lg font-semibold">Jump back in</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((r) => (
              <Link
                key={r.href + r.title}
                to={r.href}
                className="surface surface-hover group p-6 shadow-card transition-shadow hover:shadow-lift"
              >
                <span className={cn("inline-grid h-11 w-11 place-items-center rounded-lg", r.tone)}>
                  <r.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 flex items-center gap-1.5 font-semibold">
                  {r.title}
                  <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{r.description}</p>
              </Link>
            ))}
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            Tip: press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-medium">⌘K</kbd> to search complaints or jump to any page.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
