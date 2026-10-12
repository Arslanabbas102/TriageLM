import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, MessageSquare, FileText, Bell, User,
  Shield, Users, Moon, Sun, FileWarning,
} from "lucide-react";
import type { Complaint } from "@/types/complaint";

const NAV = [
  { label: "Home", path: "/", icon: LayoutDashboard },
  { label: "TriageLM Chat", path: "/chat", icon: MessageSquare },
  { label: "My Dashboard", path: "/user/dashboard", icon: LayoutDashboard },
  { label: "My Complaints", path: "/user/complaints", icon: FileText },
  { label: "Notifications", path: "/user/notifications", icon: Bell },
  { label: "Profile", path: "/user/profile", icon: User },
  { label: "Manager Dashboard", path: "/manager/dashboard", icon: Users },
  { label: "Admin Dashboard", path: "/admin/dashboard", icon: Shield },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Only queries once the user has typed enough to be meaningful.
  const { data: complaints } = useQuery({
    queryKey: ["command-search", search],
    enabled: open && search.trim().length >= 2,
    queryFn: async () => {
      const safe = search.trim().replace(/[%,()]/g, "");
      const { data } = await supabase
        .from("complaints")
        .select("id,reference,title,status")
        .or(`title.ilike.%${safe}%,reference.ilike.%${safe}%,customer_name.ilike.%${safe}%`)
        .limit(6);
      return (data ?? []) as Pick<Complaint, "id" | "reference" | "title" | "status">[];
    },
  });

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
    setSearch("");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search complaints or jump to a page…"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {!!complaints?.length && (
          <>
            <CommandGroup heading="Complaints">
              {complaints.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.reference} ${c.title}`}
                  onSelect={() => go("/user/complaints")}
                >
                  <FileWarning className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{c.reference}</span>
                  <span className="ml-2 truncate text-muted-foreground">{c.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Navigation">
          {NAV.map((item) => (
            <CommandItem key={item.path} value={item.label} onSelect={() => go(item.path)}>
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Appearance">
          <CommandItem
            value="toggle theme"
            onSelect={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
              setOpen(false);
            }}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="mr-2 h-4 w-4 text-muted-foreground" />
            ) : (
              <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
            )}
            Switch to {resolvedTheme === "dark" ? "light" : "dark"} theme
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
