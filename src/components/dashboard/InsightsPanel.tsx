import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Target,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Info,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  type: "positive" | "negative" | "info" | "warning" | "critical";
  category: "performance" | "accuracy" | "system";
  message: string;
  description: string;
  icon: any;
}

interface InsightsPanelProps {
  trends: any[];
  summary: any;
  isLoading?: boolean;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ trends, summary, isLoading }) => {
  const insights = useMemo(() => {
    if (isLoading || !trends || trends.length < 5) return [];

    const list: Insight[] = [];

    // 1. PERFORMANCE ANALYSIS (Moving Average Baseline)
    const values = trends.map(t => t.total_trees || 0);
    const latest = values[values.length - 1];
    const movingAverage = values.slice(-5, -1).reduce((a, b) => a + b, 0) / 4;
    const deviation = movingAverage > 0 ? ((latest - movingAverage) / movingAverage) * 100 : 0;

    if (deviation > 25) {
      list.push({
        type: "positive",
        category: "performance",
        message: "Efisiensi Melonjak",
        description: `Output deteksi berada ${deviation.toFixed(1)}% di atas baseline rata-rata 5 periode terakhir.`,
        icon: TrendingUp
      });
    } else if (deviation < -30) {
      list.push({
        type: "critical",
        category: "performance",
        message: "Anomali Deteksi Rendah",
        description: `Output deteksi turun drastis (${deviation.toFixed(1)}%) di bawah baseline. Periksa sensor drone.`,
        icon: TrendingDown
      });
    }

    // 2. ACCURACY ANALYSIS (Mocked with Confidence Scores)
    const avgConfidence = 89.5; // Mock
    if (avgConfidence < 85) {
      list.push({
        type: "warning",
        category: "accuracy",
        message: "Confidence Score Menurun",
        description: `Rata-rata tingkat kepercayaan AI turun ke ${avgConfidence}%. Kalibrasi model mungkin diperlukan.`,
        icon: Target
      });
    }

    // 3. SYSTEM HEALTH
    const failureRate = 0.5; // Mock
    if (failureRate > 2) {
      list.push({
        type: "critical",
        category: "system",
        message: "Tingkat Kegagalan Tinggi",
        description: "Banyak pekerjaan deteksi gagal di antrean. Periksa status ODM worker.",
        icon: AlertTriangle
      });
    } else {
      list.push({
        type: "info",
        category: "system",
        message: "Sistem Stabil",
        description: "Latensi API dan integritas data berada dalam parameter optimal.",
        icon: ShieldCheck
      });
    }

    return list;
  }, [trends, summary, isLoading]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-2xl border border-dashed" />
        ))}
      </div>
    );
  }

  const grouped = {
    performance: insights.filter(i => i.category === "performance"),
    accuracy: insights.filter(i => i.category === "accuracy"),
    system: insights.filter(i => i.category === "system"),
  };

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, items]) => {
        if (items.length === 0) return null;
        return (
          <div key={category} className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2">{category}</p>
            <div className="grid gap-3">
              {items.map((insight, i) => (
                <Card
                  key={i}
                  className={cn(
                    "p-4 border-l-4 transition-all hover:translate-x-1 cursor-default bg-card/30 backdrop-blur-sm",
                    insight.type === "positive" && "border-l-emerald-500",
                    insight.type === "critical" && "border-l-destructive",
                    insight.type === "warning" && "border-l-amber-500",
                    insight.type === "info" && "border-l-blue-500"
                  )}
                >
                  <div className="flex gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      insight.type === "positive" && "bg-emerald-500/10 text-emerald-600",
                      insight.type === "critical" && "bg-destructive/10 text-destructive",
                      insight.type === "warning" && "bg-amber-500/10 text-amber-600",
                      insight.type === "info" && "bg-blue-500/10 text-blue-600"
                    )}>
                      <insight.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-card-foreground">{insight.message}</h4>
                      <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
