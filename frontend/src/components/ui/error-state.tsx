import * as React from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/utils/cn"

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = "Something went wrong", 
  description = "There was an error loading this data. Please try again.", 
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center rounded-lg border border-rose-500/20 bg-rose-500/5", className)}>
      <AlertCircle className="h-10 w-10 text-rose-500 mb-4" />
      <h3 className="text-lg font-medium text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-sm">{description}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  )
}
