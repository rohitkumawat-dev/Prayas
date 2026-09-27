import * as React from "react"
import { cn } from "@/utils/cn"

export function LoadingSpinner({ 
  className, 
  size = "md",
  color = "violet"
}: { 
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "violet" | "slate" | "white"
}) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4"
  }

  const colors = {
    violet: "border-violet-500 border-t-transparent",
    slate: "border-slate-500 border-t-transparent",
    white: "border-white border-t-transparent"
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full inline-block",
        sizes[size],
        colors[color],
        className
      )}
    />
  )
}
