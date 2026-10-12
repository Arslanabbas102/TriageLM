
import React from 'react';
import { CheckCircle2, Circle, CircleAlert, CircleDotDashed, CircleX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'need-help' | 'failed';
  tools?: string[];
}

interface AIAgentProgressProps {
  tasks: AgentTask[];
  className?: string;
}

export const AIAgentProgress: React.FC<AIAgentProgressProps> = ({ tasks, className }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'in-progress':
        return <CircleDotDashed className="h-4 w-4 text-info animate-pulse" />;
      case 'need-help':
        return <CircleAlert className="h-4 w-4 text-warning" />;
      case 'failed':
        return <CircleX className="h-4 w-4 text-destructive" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground/50" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'in-progress':
        return 'bg-info/10 text-info';
      case 'need-help':
        return 'bg-warning/10 text-warning';
      case 'failed':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className={`surface p-4 space-y-3 shadow-card ${className ?? ""}`}>
      <h3 className="text-sm font-semibold mb-3">AI Agent Progress</h3>
      <AnimatePresence>
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50"
          >
            <div className="mt-0.5">
              {getStatusIcon(task.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">
                  {task.title}
                </p>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
              {task.tools && task.tools.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="bg-muted text-muted-foreground px-2 py-0.5 text-xs rounded"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
