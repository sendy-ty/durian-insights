import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  chartData?: any[];
  className?: string;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  chartData = [
    { v: 40 }, { v: 30 }, { v: 45 }, { v: 50 }, { v: 40 }, { v: 60 }, { v: 55 }
  ],
  className,
  isLoading,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse flex flex-col justify-between h-[160px] rounded-2xl bg-muted/40 border border-border p-6" />
    );
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        className
      )}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{title}</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black tracking-tight text-card-foreground">
              {value}
            </span>
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                  trend.isPositive
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.value}%
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] font-medium text-muted-foreground/70 leading-tight pt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
          "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground shadow-sm"
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Mini Sparkline */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-50 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#grad-${title})`}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
