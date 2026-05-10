import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Variant = "default" | "brand" | "success" | "warning" | "danger" | "tax" | "cashflow";
type Size = "sm" | "md";

interface BadgeProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

const variants: Record<Variant, string> = {
  default:  "bg-gray-800 text-gray-300 border border-gray-700",
  brand:    "bg-brand/10 text-brand-text border border-brand/20",
  success:  "bg-success/10 text-success border border-success/20",
  warning:  "bg-warning/10 text-warning border border-warning/20",
  danger:   "bg-danger/10 text-danger border border-danger/20",
  tax:      "bg-violet-400/10 text-violet-400 border border-violet-400/20",
  cashflow: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20",
};

const sizes: Record<Size, string> = {
  sm: "px-2 py-0.5 text-[10px] font-semibold tracking-wide",
  md: "px-2.5 py-1 text-xs font-medium",
};

export function Badge({ variant = "default", size = "md", children, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full uppercase", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
