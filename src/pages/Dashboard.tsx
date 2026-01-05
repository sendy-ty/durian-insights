import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { DetectionChart } from "@/components/dashboard/DetectionChart";
import { MapPreview } from "@/components/dashboard/MapPreview";
import { WorkflowSteps } from "@/components/dashboard/WorkflowSteps";
import { RecentDetections } from "@/components/dashboard/RecentDetections";
import {
  TreeDeciduous,
  Activity,
  Target,
  Clock,
  ArrowRight,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <DashboardLayout
      title="Dashboard Overview"
      description="Ringkasan hasil deteksi pohon durian menggunakan citra drone"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Pohon Terdeteksi"
            value="1,247"
            subtitle="Deteksi pohon durian via citra drone"
            icon={TreeDeciduous}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Total Proses Deteksi"
            value="24"
            subtitle="Proses deteksi AI dilakukan"
            icon={Activity}
          />
          <StatCard
            title="Rata-rata Akurasi"
            value="93.4%"
            subtitle="Tingkat akurasi model AI"
            icon={Target}
            trend={{ value: 2.3, isPositive: true }}
          />
          <StatCard
            title="Deteksi Terakhir"
            value="2 jam"
            subtitle="16 November 2025"
            icon={Clock}
          />
        </div>

        {/* Workflow Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">
                Proses Deteksi Pohon
              </h2>
              <p className="text-sm text-muted-foreground">
                Alur kerja deteksi AI otomatis
              </p>
            </div>
            <Button asChild>
              <Link to="/deteksi">
                <Upload className="mr-2 h-4 w-4" />
                Mulai Deteksi Baru
              </Link>
            </Button>
          </div>
          <WorkflowSteps currentStep={1} completedSteps={[]} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart Section */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Tren Deteksi Pohon Durian
                </h2>
                <p className="text-sm text-muted-foreground">
                  Jumlah pohon terdeteksi per periode
                </p>
              </div>
            </div>
            <DetectionChart />
          </div>

          {/* Detection Results Summary */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">
              Hasil Deteksi
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <span className="text-sm text-muted-foreground">
                  Jumlah Pohon Durian
                </span>
                <span className="text-xl font-bold text-primary">1,247</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <span className="text-sm text-muted-foreground">Model AI</span>
                <span className="text-sm font-semibold text-card-foreground">
                  YOLO (yolov8m)
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <span className="text-sm text-muted-foreground">
                  Confidence
                </span>
                <span className="text-sm font-semibold text-primary">
                  93.4%
                </span>
              </div>
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
                  Preview Peta Digital
                </h2>
                <p className="text-sm text-muted-foreground">
                  Visualisasi hasil deteksi pada peta
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
                  Deteksi Terbaru
                </h2>
                <p className="text-sm text-muted-foreground">
                  Riwayat proses deteksi terakhir
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

        {/* Footer */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Dikembangkan oleh Tim Capstone • Telkom University Purwokerto
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
