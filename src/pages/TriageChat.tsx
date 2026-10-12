
import React, { useState, useRef, useEffect } from 'react';
import { EnhancedPromptInput } from "@/components/EnhancedPromptInput";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { AIAgentProgress } from "@/components/AIAgentProgress";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { LoadingMessage } from "@/components/LoadingMessage";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import type { AgentTask } from "@/components/AIAgentProgress";
import type { SimulatedUser, ChatMessage as ChatMessageType } from "@/types/chat";

interface TriageChatProps {
  currentUser: SimulatedUser;
}

const TriageChat: React.FC<TriageChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      sender: 'bot',
      content: `Hi ${currentUser.name},\n\nWelcome to TriageLM customer service. I'm here to help with any complaint or concern about a recent purchase or your experience with us.\n\nDescribe the issue you're facing and I'll do my best to get you a fast, satisfying resolution.\n\nBest regards,\nThe TriageLM team`,
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [conversationEnded, setConversationEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, files?: FileList) => {
    if (!content.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      sender: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Initialize agent tasks
    const initialTasks: AgentTask[] = [
      {
        id: 'classify',
        title: 'Analysing the complaint',
        description: 'Classifying complaint type and sentiment with Gemma',
        status: 'in-progress',
        tools: ['gemma-classifier']
      },
      {
        id: 'search',
        title: 'Searching transaction history',
        description: 'Looking up prior orders and related complaints',
        status: 'pending',
        tools: ['supabase-search']
      },
      {
        id: 'orchestrate',
        title: 'Drafting a response',
        description: 'Generating a tailored resolution with Gemini',
        status: 'pending',
        tools: ['gemini-orchestrator']
      }
    ];

    setAgentTasks(initialTasks);

    try {
      // Update first task to completed
      setAgentTasks(prev => prev.map(task => 
        task.id === 'classify' 
          ? { ...task, status: 'completed' }
          : task.id === 'search'
          ? { ...task, status: 'in-progress' }
          : task
      ));

      // Simulate some delay for the search
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data, error } = await supabase.functions.invoke('analyze-complaint', {
        body: {
          userId: currentUser.user_id,
          complaintText: content,
          chatHistory: messages.slice(-5),
          sessionId: sessionId,
          files: files ? Array.from(files) : undefined
        }
      });

      if (error) {
        throw error;
      }

      // Update search task to completed, orchestrate to in-progress
      setAgentTasks(prev => prev.map(task => 
        task.id === 'search' 
          ? { ...task, status: 'completed' }
          : task.id === 'orchestrate'
          ? { ...task, status: 'in-progress' }
          : task
      ));

      // Simulate response generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Complete all tasks
      setAgentTasks(prev => prev.map(task => 
        task.id === 'orchestrate' 
          ? { ...task, status: 'completed' }
          : task
      ));

      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: data.response || "I'm sorry — I'm having technical difficulties. Please contact our support team directly for help.",
        timestamp: new Date(),
        metadata: {
          classifications: data.classifications,
          searchResults: data.searchResults
        }
      };

      setMessages(prev => [...prev, botMessage]);

      if (data.classifications) {
        toast({
          title: "Analysis complete",
          description: `Classified as: ${data.classifications.complaint_category}`,
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mark tasks as failed
      setAgentTasks(prev => prev.map(task => 
        task.status === 'in-progress' || task.status === 'pending'
          ? { ...task, status: 'failed' }
          : task
      ));

      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: "Dear customer,\n\nI'm sorry for the technical difficulty we're currently experiencing. Our technical team has been notified and is working on a fast fix.\n\nIn the meantime, please contact our customer service team directly at support@company.com or call our helpline for immediate assistance.\n\nThank you for your patience.\n\nBest regards,\nThe TriageLM team",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection error",
        description: "Could not process the request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndConversation = () => {
    setShowFeedbackDialog(true);
  };

  const handleFeedbackSubmit = (rating: number, feedback?: string) => {
    console.log('Feedback submitted:', { rating, feedback, sessionId });
    
    toast({
      title: "Thanks for the feedback",
      description: `You rated this ${rating}/10. Your feedback helps us improve.`,
    });
    
    setConversationEnded(true);
    
    // Here you could send the feedback to your backend
    // await supabase.functions.invoke('submit-feedback', { body: { rating, feedback, sessionId } });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <ChatHeader currentUser={currentUser} sessionId={sessionId} />

      <div className="page-gradient mx-auto flex w-full max-w-6xl flex-1">
        {/* Conversation */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && <LoadingMessage />}

            <div ref={messagesEndRef} />
          </div>

          {messages.length > 1 && !conversationEnded && (
            <div className="flex justify-center px-4 pb-2">
              <Button variant="outline" size="sm" onClick={handleEndConversation} className="gap-2">
                <Star className="h-3.5 w-3.5" />
                End conversation and rate
              </Button>
            </div>
          )}

          {!conversationEnded ? (
            <div className="border-t border-border bg-background/80 p-4 backdrop-blur-md">
              <EnhancedPromptInput
                placeholder="Describe your complaint or issue in detail…"
                onSubmit={handleSendMessage}
                onFileUpload={(files) => handleSendMessage("Files uploaded for review", files)}
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="border-t border-border bg-background/80 p-6 text-center backdrop-blur-md">
              <p className="text-sm text-muted-foreground">
                This conversation has ended. Thanks for contacting us.
              </p>
            </div>
          )}
        </div>

        {/* Agent progress */}
        {agentTasks.length > 0 && (
          <aside className="hidden w-80 shrink-0 border-l border-border bg-card/40 p-4 lg:block">
            <AIAgentProgress tasks={agentTasks} />
          </aside>
        )}
      </div>

      {/* Feedback Dialog */}
      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
};

export default TriageChat;
