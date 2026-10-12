import { Home, MessageSquare, User, Bell, LogOut, Shield, Users, FileText, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const userItems = [
  { title: "Dashboard", path: "/user/dashboard", icon: Home },
  { title: "My Complaints", path: "/user/complaints", icon: FileText },
  { title: "TriageLM Chat", path: "/chat", icon: MessageSquare },
  { title: "Notifications", path: "/user/notifications", icon: Bell },
  { title: "Profile", path: "/user/profile", icon: User },
];

const managerItems = [
  { title: "Dashboard", path: "/manager/dashboard", icon: Home },
  { title: "All Complaints", path: "/user/complaints", icon: FileText },
  { title: "TriageLM Chat", path: "/chat", icon: MessageSquare },
];

const adminItems = [
  { title: "Dashboard", path: "/admin/dashboard", icon: Shield },
  { title: "All Complaints", path: "/user/complaints", icon: FileText },
  { title: "Team View", path: "/manager/dashboard", icon: Users },
  { title: "TriageLM Chat", path: "/chat", icon: MessageSquare },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const items = location.pathname.startsWith("/admin")
    ? adminItems
    : location.pathname.startsWith("/manager")
    ? managerItems
    : userItems;

  const sectionLabel = location.pathname.startsWith("/admin")
    ? "Administration"
    : location.pathname.startsWith("/manager")
    ? "Management"
    : "Workspace";

  const handleLogout = () => {
    toast({ title: "Signed out", description: "You have been signed out." });
    navigate("/");
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar flex h-full flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold">TriageLM</p>
            <p className="text-xs text-muted-foreground">Complaint AI</p>
          </div>
        </div>

        <SidebarGroup className="flex-grow">
          <SidebarGroupLabel className="text-muted-foreground">{sectionLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                      )}
                    >
                      <item.icon className="h-4.5 w-4.5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="mt-auto pb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="cursor-pointer text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
