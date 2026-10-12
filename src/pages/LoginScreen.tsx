import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, ShieldCheck, Settings, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CreateUserDialog } from "@/components/CreateUserDialog";
import { cn } from "@/lib/utils";

interface SimulatedUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginScreenProps {
  onUserSelect: (user: SimulatedUser) => void;
}

const ROLE_STYLE: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  manager: "bg-info/10 text-info border-info/20",
  customer: "bg-success/10 text-success border-success/20",
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onUserSelect }) => {
  const [selectedUser, setSelectedUser] = useState<SimulatedUser | null>(null);
  const { toast } = useToast();

  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['simulated-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('simulated_users')
        .select('*')
        .order('role', { ascending: false });

      if (error) {
        toast({
          title: "Could not load users",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data as SimulatedUser[];
    },
  });

  const handleLogin = () => {
    if (!selectedUser) return;
    onUserSelect(selectedUser);
    toast({ title: "Signed in", description: `Welcome, ${selectedUser.name}.` });
  };

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <ShieldCheck className="h-3 w-3" />;
    if (role === 'manager') return <Settings className="h-3 w-3" />;
    return <User className="h-3 w-3" />;
  };

  return (
    <div className="page-gradient flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <span className="font-bold tracking-tight">TriageLM</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Choose a user to simulate</h1>
            <p className="mt-3 text-muted-foreground">
              This demo has no real authentication — pick any profile to explore that role,
              or create your own.
            </p>
            <div className="mt-5 flex justify-center">
              {/* Newly created users are selected immediately so you can sign straight in. */}
              <CreateUserDialog onCreated={(user) => setSelectedUser(user)} />
            </div>
          </div>

          {isError && (
            <div className="mx-auto mt-8 flex max-w-xl items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Could not reach the database</p>
                <p className="mt-1 text-muted-foreground">
                  {(error as Error)?.message ?? "Check that Supabase is running."}
                </p>
              </div>
            </div>
          )}

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="surface p-4 shadow-card">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-11 w-11 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                    <Skeleton className="mt-4 h-5 w-20" />
                  </div>
                ))
              : users?.map((user) => {
                  const active = selectedUser?.id === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      aria-pressed={active}
                      className={cn(
                        "surface p-4 text-left shadow-card transition-all",
                        active
                          ? "border-primary ring-2 ring-primary/30"
                          : "hover:border-primary/40 hover:shadow-lift"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11">
                          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                            {user.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{user.name}</p>
                          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={cn("gap-1 capitalize", ROLE_STYLE[user.role] ?? ROLE_STYLE.customer)}
                        >
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">{user.user_id}</span>
                      </div>
                    </button>
                  );
                })}
          </div>

          <div className="mt-10 flex justify-center">
            <Button size="lg" className="gap-2" disabled={!selectedUser} onClick={handleLogin}>
              {selectedUser ? `Continue as ${selectedUser.name}` : "Select a user to continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
