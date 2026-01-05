import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { DetectionChart } from "@/components/dashboard/DetectionChart";
import { MapPreview } from "@/components/dashboard/MapPreview";
import { RecentDetections } from "@/components/dashboard/RecentDetections";
import { TreeDeciduous, Target, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <DashboardLayout
      title="Dashboard"
      description="Ringkasan hasil deteksi pohon durian"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats Grid - Simplified to 3 essential metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
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

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Chart Section */}
          <div className="lg:col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">
                Tren Deteksi
              </h2>
              <p className="text-sm text-muted-foreground">
                Jumlah pohon terdeteksi per periode
              </p>
            </div>
            <DetectionChart />
          </div>

          {/* System Info */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">
              Informasi Sistem
            </h2>
            <div className="space-y-3">
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

            <div className="mt-6 pt-4 border-t border-border">
              <Button className="w-full" asChild>
                <Link to="/deteksi">Mulai Deteksi Baru</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Map Preview and Recent Detections */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Map Preview */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Peta Terbaru
                </h2>
                <p className="text-sm text-muted-foreground">
                  Hasil deteksi pada peta digital
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/peta">
                  Lihat Peta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <MapPreview />
          </div>

          {/* Recent Detections */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Riwayat Terbaru
                </h2>
                <p className="text-sm text-muted-foreground">
                  Proses deteksi terakhir
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/riwayat">
                  Lihat Semua
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <RecentDetections />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;