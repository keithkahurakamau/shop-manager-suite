import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  metric: string;
  icon?: ReactNode;
  trend?: string;
  variant?: "default" | "warning" | "success";
}

export function KPICard({ title, metric, icon, trend, variant = "default" }: KPICardProps) {
  return (
    <div className={cn(
      "rounded-lg p-6 card-shadow transition-card hover:card-shadow-hover bg-card text-card-foreground",
      variant === "warning" && "border-l-4 border-l-warning",
      variant === "success" && "border-l-4 border-l-success",
    )}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{metric}</p>
      {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
    </div>
  );
}
