import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                i === current
                  ? "bg-brand text-white ring-4 ring-brand/20"
                  : i < current
                  ? "bg-brand/30 text-brand-text"
                  : "bg-surface-overlay text-gray-500"
              )}
            >
              {i < current ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium hidden sm:block",
                i === current ? "text-gray-200" : i < current ? "text-gray-500" : "text-gray-600"
              )}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-px w-10 mb-3 mx-1 transition-colors",
                i < current ? "bg-brand/40" : "bg-gray-700"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
