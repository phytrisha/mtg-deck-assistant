import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

interface DeepDiveButtonProps {
  title: string;
  description: string;
  analysisType: string;
  status: "pending" | "running" | "completed" | "error";
  onClick: (type: string) => void;
}

export function DeepDiveButton({
  title,
  description,
  analysisType,
  status,
  onClick,
}: DeepDiveButtonProps) {
  return (
    <Button
      variant="outline"
      className="h-auto flex-col items-start p-4 hover:bg-accent"
      onClick={() => onClick(analysisType)}
      disabled={status === "running"}
    >
      <div className="flex items-center gap-2 w-full mb-1">
        {status === "running" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "completed" && <CheckCircle className="h-4 w-4 text-primary" />}
        {status === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
        {status === "pending" && <Sparkles className="h-4 w-4" />}
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <span className="text-xs text-muted-foreground text-left">{description}</span>
    </Button>
  );
}
