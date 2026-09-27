import * as React from "react"
import { cn } from "@/utils/cn"

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "violet" | "cyan" | "emerald" | "amber" | "rose";
  label?: string;
  showValue?: boolean;
  className?: string;
  heightClassName?: string;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({ 
  value, 
  max = 100, 
  color = "violet",
  label,
  showValue,
  className,
  heightClassName,
  size
}: ProgressBarProps) {
  const sizeMap = { sm: "h-1.5", md: "h-2", lg: "h-3" };
  const hClass = heightClassName || (size ? sizeMap[size] : "h-2");
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const colors = {
    violet: "bg-violet-500",
    cyan: "bg-cyan-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500"
  }

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1 text-sm">
          {label && <span className="text-slate-300 font-medium">{label}</span>}
          {showValue && <span className="text-slate-400">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-slate-800 rounded-full overflow-hidden", hClass)}>
        <div 
          className={cn("h-full rounded-full transition-all duration-500 ease-in-out", colors[color])} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
