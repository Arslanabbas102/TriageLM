import React from 'react';
import { Bot } from "lucide-react";

export const LoadingMessage: React.FC = () => {
  return (
    <div className="flex justify-start gap-2.5">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Bot className="h-4 w-4" />
      </span>
      <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3.5 shadow-card">
        <div className="flex items-center gap-1.5" role="status" aria-label="Assistant is typing">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
