import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { DetectionChart } from "@/components/dashboard/DetectionChart";
import { TreeDeciduous, Target, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <DashboardLayout
      title="Dashboard"
      description="Ringkasan hasil deteksi pohon durian"
    >
      <div className="animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
        {/* Stats Grid - 3 essential metrics */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <StatCard
            title="Total Pohon"
            value="1,247"
            subtitle="Terdeteksi dari citra drone"
            icon={TreeDeciduous}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Akurasi Deteksi"
            value="93.4%"
            subtitle="Model YOLOv11"
            icon={Target}
          />
          <StatCard
            title="Area Terpetakan"
            value="45.2 Ha"
            subtitle="6 lokasi kebun"
            icon={MapPin}
          />
        </div>

        {/* Main Content Grid - flex-1 to fill remaining space */}
        <div className="grid gap-6 lg:grid-cols-5 flex-1 min-h-0">
          {/* Chart Section */}
          <div className="lg:col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">
                Tren Deteksi
              </h2>
              <p className="text-sm text-muted-foreground">
                Jumlah pohon terdeteksi per periode
              </p>
            </div>
            <div className="flex-1 min-h-0">
              <DetectionChart />
            </div>
          </div>

          {/* System Info */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">
              Informasi Sistem
            </h2>
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Model AI</span>
                <span className="text-sm font-medium text-card-foreground">
                  YOLOv11
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">
                  Total Deteksi
                </span>
                <span className="text-sm font-medium text-card-foreground">
                  24 proses
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">
                  Deteksi Terakhir
                </span>
                <span className="text-sm font-medium text-card-foreground">
                  16 Nov 2025
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border space-y-2">
              <Button className="w-full" asChild>
                <Link to="/deteksi">
                  Mulai Deteksi Baru
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/peta">
                  Lihat Peta Digital
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
