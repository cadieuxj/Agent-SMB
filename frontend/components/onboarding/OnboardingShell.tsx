import { Brain, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepIndicator from "@/components/onboarding/StepIndicator";

interface OnboardingShellProps {
  steps: string[];
  current: number;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  children: React.ReactNode;
}

export default function OnboardingShell({
  steps,
  current,
  onBack,
  onNext,
  nextLabel = "Suivant",
  nextDisabled,
  nextLoading,
  children,
}: OnboardingShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-surface-raised">
        <div className="flex items-center gap-2 min-w-[80px]">
          <Brain size={18} className="text-brand" />
          <span className="font-semibold text-sm text-white">Agent SMB</span>
        </div>
        <StepIndicator steps={steps} current={current} />
        <div className="min-w-[80px]" />
      </header>

      <main className="flex-1 flex justify-center px-4 pt-10 pb-6 overflow-y-auto">
        <div className="w-full max-w-lg">{children}</div>
      </main>

      <footer className="border-t border-gray-800 bg-surface-raised px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto w-full">
          {current > 0 ? (
            <Button variant="ghost" onClick={onBack} icon={<ChevronLeft size={15} />}>
              Retour
            </Button>
          ) : (
            <div />
          )}
          {onNext && (
            <Button onClick={onNext} disabled={nextDisabled} loading={nextLoading}>
              {nextLabel}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
