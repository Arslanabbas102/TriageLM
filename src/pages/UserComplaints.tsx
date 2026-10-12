import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Search, Download, X, ChevronLeft, ChevronRight, Inbox, ArrowUpDown, Loader2,
} from "lucide-react";
import {
  useComplaints, useComplaintOptions, useUpdateComplaintStatus,
  fetchAllComplaints, DEFAULT_FILTERS, type ComplaintFilters,
} from "@/hooks/useComplaints";
import {
  STATUSES, PRIORITIES, STATUS_LABEL, STATUS_CLASS, PRIORITY_CLASS,
  type Complaint, type ComplaintStatus,
} from "@/types/complaint";
import { toCsv, downloadCsv } from "@/lib/export-csv";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "created_at.desc", label: "Newest first" },
  { value: "created_at.asc", label: "Oldest first" },
  { value: "priority.asc", label: "Priority A–Z" },
  { value: "status.asc", label: "Status A–Z" },
  { value: "customer_name.asc", label: "Customer A–Z" },
];

const CSV_COLUMNS = [
  { key: "reference" as const, label: "Reference" },
  { key: "title" as const, label: "Title" },
  { key: "customer_name" as const, label: "Customer" },
  { key: "status" as const, label: "Status" },
  { key: "priority" as const, label: "Priority" },
  { key: "category" as const, label: "Category" },
  { key: "channel" as const, label: "Channel" },
  { key: "order_number" as const, label: "Order" },
  { key: "ai_category" as const, label: "AI category" },
  { key: "ai_resolution" as const, label: "AI resolution" },
  { key: "satisfaction_rating" as const, label: "Satisfaction" },
  { key: "created_at" as const, label: "Created" },
  { key: "resolved_at" as const, label: "Resolved" },
];

const UserComplaints = () => {
  const [filters, setFilters] = useState<ComplaintFilters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, isFetching } = useComplaints(filters);
  const { data: options } = useComplaintOptions();
  const updateStatus = useUpdateComplaintStatus();

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize));

  // Any change other than paging should return to the first page.
  const patch = (next: Partial<ComplaintFilters>) =>
    setFilters((f) => ({ ...f, ...next, page: next.page ?? 1 }));

  const activeFilterCount = useMemo(
    () =>
      [filters.status, filters.priority, filters.category, filters.channel].filter(
        (v) => v !== "all"
      ).length + (filters.search.trim() ? 1 : 0),
    [filters]
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      const all = await fetchAllComplaints(filters);
      if (!all.length) {
        toast({ title: "Nothing to export", description: "No complaints match the current filters." });
        return;
      }
      downloadCsv(`complaints-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(all, CSV_COLUMNS));
      toast({ title: "Export ready", description: `${all.length} complaints downloaded as CSV.` });
    } catch (e) {
      toast({ title: "Export failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = (id: string, status: ComplaintStatus) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast({ title: "Status updated", description: `Marked as ${STATUS_LABEL[status]}.` });
          setSelected(null);
        },
        onError: (e) =>
          toast({ title: "Update failed", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  return (
    <AppShell
      title="Complaints"
      description={`${total} complaint${total === 1 ? "" : "s"} matching your filters`}
      actions={
        <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting} className="gap-1.5">
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">Export CSV</span>
        </Button>
      }
    >
      {/* Toolbar */}
      <div className="surface shadow-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => patch({ search: e.target.value })}
              placeholder="Search title, customer, reference or order…"
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={filters.status} onValueChange={(v) => patch({ status: v })}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(v) => patch({ priority: v })}>
              <SelectTrigger className="w-[135px]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {PRIORITIES.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(v) => patch({ category: v })}>
              <SelectTrigger className="w-[165px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {options?.categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.sort} onValueChange={(v) => patch({ sort: v })}>
              <SelectTrigger className="w-[150px]">
                <ArrowUpDown className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)} className="gap-1 text-muted-foreground">
                <X className="h-3.5 w-3.5" /> Clear ({activeFilterCount})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="surface mt-4 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[110px]">Reference</TableHead>
                <TableHead className="min-w-[240px]">Complaint</TableHead>
                <TableHead className="hidden md:table-cell">Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Priority</TableHead>
                <TableHead className="hidden lg:table-cell">Category</TableHead>
                <TableHead className="hidden xl:table-cell text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-56 text-center">
                    <Inbox className="mx-auto h-9 w-9 text-muted-foreground/50" />
                    <p className="mt-3 font-medium">No complaints found</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try adjusting your search or filters.
                    </p>
                    {activeFilterCount > 0 && (
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => setFilters(DEFAULT_FILTERS)}>
                        Clear filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((c) => (
                  <TableRow
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">{c.reference}</TableCell>
                    <TableCell>
                      <p className="font-medium leading-tight">{c.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{c.description}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{c.customer_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("whitespace-nowrap", STATUS_CLASS[c.status])}>
                        {STATUS_LABEL[c.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className={cn("capitalize", PRIORITY_CLASS[c.priority])}>
                        {c.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{c.category}</TableCell>
                    <TableCell className="hidden xl:table-cell text-right text-sm text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {total === 0 ? "No results" : (
              <>
                Showing <span className="font-medium text-foreground">{(filters.page - 1) * filters.pageSize + 1}</span>
                –<span className="font-medium text-foreground">{Math.min(filters.page * filters.pageSize, total)}</span>
                {" "}of <span className="font-medium text-foreground">{total}</span>
              </>
            )}
            {isFetching && !isLoading && <Loader2 className="ml-2 inline h-3 w-3 animate-spin" />}
          </p>
          <div className="flex items-center gap-2">
            <Select value={String(filters.pageSize)} onValueChange={(v) => patch({ pageSize: Number(v) })}>
              <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[10, 25, 50].map((n) => <SelectItem key={n} value={String(n)}>{n} per page</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-8 w-8"
              disabled={filters.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[72px] text-center text-sm text-muted-foreground">
              {filters.page} / {pageCount}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8"
              disabled={filters.page >= pageCount}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6">{selected.title}</DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  {selected.reference} · {selected.customer_name}
                </DialogDescription>
              </DialogHeader>

              <p className="text-sm leading-relaxed text-muted-foreground">{selected.description}</p>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
                {[
                  ["Category", selected.category],
                  ["Channel", selected.channel],
                  ["Order", selected.order_number ?? "—"],
                  ["Priority", selected.priority],
                  ["AI category", selected.ai_category ?? "—"],
                  ["AI resolution", selected.ai_resolution ?? "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="mt-0.5 font-medium capitalize">{v}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <p className="mb-2 text-sm font-medium">Update status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={selected.status === s ? "default" : "outline"}
                      disabled={updateStatus.isPending}
                      onClick={() => handleStatusChange(selected.id, s)}
                    >
                      {STATUS_LABEL[s]}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default UserComplaints;
