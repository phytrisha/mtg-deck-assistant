"use client";

import { AnalysisStep } from "@/lib/types";
import { Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface AnalysisStepProgressProps {
  step: AnalysisStep;
}

export function AnalysisStepProgress({ step }: AnalysisStepProgressProps) {
  const getStatusIcon = () => {
    switch (step.status) {
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (step.status) {
      case "pending":
        return "text-muted-foreground";
      case "running":
        return "text-primary";
      case "completed":
        return "text-green-600";
      case "error":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
      <div className="mt-0.5">{getStatusIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className={`text-sm font-medium ${getStatusColor()}`}>
            Step {step.step}: {step.title}
          </p>
        </div>
        {step.reasoning && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {step.reasoning}
          </p>
        )}
        {step.error && (
          <p className="text-xs text-destructive mt-1">
            Error: {step.error}
          </p>
        )}
        {step.status === "running" && step.content && (
          <p className="text-xs text-muted-foreground mt-1">
            Generating insights...
          </p>
        )}
      </div>
    </div>
  );
}
