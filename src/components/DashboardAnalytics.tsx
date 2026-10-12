import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/hooks/useDashboardStats";

const STATUS_COLORS: Record<string, string> = {
  new: "hsl(var(--info))",
  "in-progress": "hsl(var(--warning))",
  resolved: "hsl(var(--success))",
  escalated: "hsl(var(--destructive))",
};

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.6rem",
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
  boxShadow: "0 8px 24px -6px hsl(220 20% 12% / 0.12)",
};

const axisProps = {
  stroke: "hsl(var(--muted-foreground))",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

function Panel({
  title, subtitle, children, loading,
}: { title: string; subtitle?: string; children: React.ReactNode; loading?: boolean }) {
  return (
    <div className="surface shadow-card p-5">
      <h3 className="font-semibold">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-5 h-64">
        {loading ? <Skeleton className="h-full w-full" /> : children}
      </div>
    </div>
  );
}

export function DashboardAnalytics({
  stats, loading,
}: { stats?: DashboardStats; loading?: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Complaint volume" subtitle="Received vs resolved, last 8 weeks" loading={loading}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats?.trend ?? []} margin={{ left: -20, right: 8, top: 4 }}>
            <defs>
              <linearGradient id="gReceived" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" {...axisProps} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="received" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gReceived)" name="Received" />
            <Area type="monotone" dataKey="resolved" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#gResolved)" name="Resolved" />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="By status" subtitle="Current distribution of the queue" loading={loading}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={stats?.byStatus ?? []}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={92}
              paddingAngle={2}
              stroke="none"
            >
              {(stats?.byStatus ?? []).map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "hsl(var(--muted-foreground))"} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="By category" subtitle="Where complaints come from" loading={loading}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats?.byCategory ?? []} layout="vertical" margin={{ left: 44, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" allowDecimals={false} {...axisProps} />
            <YAxis type="category" dataKey="name" width={118} {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 5, 5, 0]} name="Complaints" />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="By priority" subtitle="Severity mix across the queue" loading={loading}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats?.byPriority ?? []} margin={{ left: -20, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" {...axisProps} className="capitalize" />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="value" fill="hsl(var(--info))" radius={[5, 5, 0, 0]} name="Complaints" />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

export default DashboardAnalytics;
