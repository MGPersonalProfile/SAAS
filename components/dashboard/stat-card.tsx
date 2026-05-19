import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  Icon?: LucideIcon;
  accent?: "default" | "warning" | "success";
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  Icon,
  accent = "default",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "text-2xl font-bold tabular-nums leading-tight truncate",
              accent === "warning" && "text-destructive",
              accent === "success" && "text-emerald-600",
              accent === "default" && "text-primary",
            )}
            title={value}
          >
            {value}
          </p>
          {hint ? (
            <p className="text-xs text-muted-foreground line-clamp-2">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              accent === "warning" && "bg-destructive/10 text-destructive",
              accent === "success" && "bg-emerald-100 text-emerald-700",
              accent === "default" && "bg-primary/10 text-primary",
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
