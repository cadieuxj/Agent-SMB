import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PlanCardProps {
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
  onSelect?: () => void;
  isCurrent?: boolean;
  popularLabel?: string;
}

export function PlanCard({
  name, price, priceNote, description, features,
  highlighted, ctaLabel, onSelect, isCurrent, popularLabel,
}: PlanCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border p-6 flex flex-col gap-5",
        highlighted
          ? "border-brand bg-brand/5 ring-2 ring-brand/20"
          : "border-gray-700 bg-surface-raised"
      )}
    >
      {highlighted && popularLabel && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-brand text-white text-xs font-semibold px-3 py-1 rounded-full">
            {popularLabel}
          </span>
        </div>
      )}

      <div>
        <h3 className="font-bold text-white text-base">{name}</h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-bold text-white">{price}</span>
          {priceNote && <span className="text-sm text-gray-500">{priceNote}</span>}
        </div>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>

      <ul className="flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
            <Check size={14} className="text-success mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        variant={highlighted ? "primary" : "secondary"}
        className="w-full"
        disabled={isCurrent}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}
