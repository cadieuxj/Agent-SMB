import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
}

function colorClass(v: number) {
  if (v >= 80) return "bg-danger";
  if (v >= 50) return "bg-warning";
  return "bg-success";
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("w-full bg-gray-700 rounded-full h-1.5 overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-300", colorClass(pct))}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
