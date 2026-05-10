import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, number> = { sm: 14, md: 18, lg: 24 };

export function Spinner({ size = "md", className }: { size?: Size; className?: string }) {
  return (
    <Loader2
      className={cn("animate-spin text-gray-400", className)}
      size={sizes[size]}
    />
  );
}
