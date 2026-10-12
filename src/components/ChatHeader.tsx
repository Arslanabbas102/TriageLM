import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { SimulatedUser } from "@/types/chat";

interface ChatHeaderProps {
  currentUser: SimulatedUser;
  sessionId: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ currentUser, sessionId }) => {
  const backPath =
    currentUser.role === 'admin' ? '/admin/dashboard'
    : currentUser.role === 'manager' ? '/manager/dashboard'
    : '/user/dashboard';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
            <Link to={backPath} aria-label="Back to dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 leading-tight">
            <h1 className="truncate font-semibold">TriageLM Assistant</h1>
            <p className="truncate text-xs text-muted-foreground">
              Signed in as {currentUser.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="text-[11px] text-muted-foreground">Session</p>
            <p className="font-mono text-[11px] text-muted-foreground/70">{sessionId}</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
