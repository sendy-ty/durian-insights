import React from "react";
import { Card } from "@/components/ui/card";
import { Activity, Server, Database, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemHealthProps {
  apiStatus: "online" | "offline" | "slow";
  queueCount: number;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ apiStatus, queueCount }) => {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">System Health</h3>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "h-2 w-2 rounded-full animate-pulse",
              apiStatus === "online" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            )} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {apiStatus === "online" ? "All Systems Operational" : "System Issues Detected"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Server className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase">API Endpoint</span>
            </div>
            <p className="text-xs font-black">v1.2.4 - Stable</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Database className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase">DB Latency</span>
            </div>
            <p className="text-xs font-black">12ms</p>
          </div>

          <div className="col-span-2 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Cpu className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Processing Queue</p>
                <p className="text-sm font-black text-card-foreground">{queueCount} Jobs</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[9px] font-black text-primary uppercase">Active</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
