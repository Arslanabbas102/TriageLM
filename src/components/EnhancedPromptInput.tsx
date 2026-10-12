
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedPromptInputProps {
  placeholder?: string;
  onSubmit?: (value: string, files?: FileList) => void;
  onChange?: (value: string) => void;
  onFileUpload?: (files: FileList) => void;
  disabled?: boolean;
  className?: string;
}

export const EnhancedPromptInput = React.forwardRef<HTMLDivElement, EnhancedPromptInputProps>(
  ({ placeholder = "Describe your complaint or issue…", onSubmit, onChange, onFileUpload, disabled = false, className }, ref) => {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim() && onSubmit) {
        onSubmit(value.trim());
        setValue("");
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
      
      if (onChange) {
        onChange(newValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && onSubmit) {
          onSubmit(value.trim());
          setValue("");
          // Reset textarea height
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
        }
      }
    };

    const handleFileUpload = () => {
      fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && onFileUpload) {
        onFileUpload(files);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full max-w-4xl mx-auto items-end gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
          className
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleFileUpload}
          disabled={disabled}
          className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
        >
          <Paperclip size={18} />
          <span className="sr-only">Upload file</span>
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.txt"
          multiple
          className="hidden"
        />
        
        <form onSubmit={handleSubmit} className="flex w-full items-end gap-3">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 min-h-[60px] max-h-[200px] resize-none bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 text-sm leading-relaxed"
            style={{ height: 'auto' }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !value.trim()}
            className="h-10 w-10 shrink-0"
          >
            <ArrowUp size={18} />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    );
  }
);

EnhancedPromptInput.displayName = "EnhancedPromptInput";
