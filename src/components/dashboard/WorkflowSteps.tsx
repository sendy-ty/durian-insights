import { cn } from "@/lib/utils";
import { Upload, Brain, Map, FileText, Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  { id: 1, label: "Upload Data", icon: Upload },
  { id: 2, label: "Deteksi AI", icon: Brain },
  { id: 3, label: "Visualisasi", icon: Map },
  { id: 4, label: "Laporan", icon: FileText },
];

interface WorkflowStepsProps {
  currentStep?: number;
  completedSteps?: number[];
}

export function WorkflowSteps({
  currentStep = 1,
  completedSteps = [],
}: WorkflowStepsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center",
                    isCurrent || isCompleted
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 transition-colors duration-300",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
