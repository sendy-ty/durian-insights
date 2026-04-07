import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { DetectionChart } from "@/components/dashboard/DetectionChart";
import {
  TreeDeciduous,
  Target,
  MapPin,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileImage,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  useDashboardSummary,
  useDashboardTrends,
  useLatestImages,
} from "@/hooks/useDashboard";

const Dashboard = () => {
  const summaryQuery = useDashboardSummary();
  const trendsQuery = useDashboardTrends();
  const latestImagesQuery = useLatestImages();

  const stats = summaryQuery.data?.stats;
  const isLoading = summaryQuery.isLoading;
  const isError = summaryQuery.isError;

  return (
    <DashboardLayout
      title="Dashboard"
      description="Ringkasan hasil deteksi pohon durian"
    >
      <div className="animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
        {/* Error banner */}
        {isError && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Gagal memuat data dashboard</p>
              <p className="text-xs text-destructive/80">
                Periksa koneksi ke server dan coba muat ulang halaman.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => {
                summaryQuery.refetch();
                trendsQuery.refetch();
                latestImagesQuery.refetch();
              }}
            >
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Stats Grid - 3 essential metrics */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-center"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Pohon"
                value={stats?.total_trees?.toLocaleString() ?? "–"}
                subtitle="Terdeteksi dari citra drone"
                icon={TreeDeciduous}
              />
              <StatCard
                title="Akurasi Deteksi"
                value={
                  stats?.average_accuracy != null
                    ? `${stats.average_accuracy.toFixed(1)}%`
                    : "–"
                }
                subtitle="Model YOLOv11"
                icon={Target}
              />
              <StatCard
                title="Area Terpetakan"
                value={
                  stats?.total_area_hectares != null
                    ? `${stats.total_area_hectares.toFixed(1)} Ha`
                    : "–"
                }
                subtitle={`${stats?.total_detections ?? 0} deteksi`}
                icon={MapPin}
              />
            </>
          )}
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
              {trendsQuery.isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : trendsQuery.isError ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-8 w-8" />
                  <p className="text-sm">Gagal memuat tren deteksi</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => trendsQuery.refetch()}
                  >
                    Coba Lagi
                  </Button>
                </div>
              ) : (
                <DetectionChart data={trendsQuery.data} />
              )}
            </div>
          </div>

          {/* Right panel — Latest Images + Actions */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">
              Citra Terbaru
            </h2>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {latestImagesQuery.isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : latestImagesQuery.isError ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                  <AlertCircle className="h-6 w-6" />
                  <p className="text-xs">Gagal memuat citra</p>
                </div>
              ) : latestImagesQuery.data && latestImagesQuery.data.length > 0 ? (
                latestImagesQuery.data.map((img) => (
                  <div
                    key={img.image_id}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted/70"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                      <FileImage className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {img.filename}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(img.upload_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                  <FileImage className="h-8 w-8" />
                  <p className="text-sm">Belum ada citra</p>
                  <p className="text-xs">Upload citra drone untuk memulai</p>
                </div>
              )}

              {/* System info at the bottom */}
              <div className="pt-2 border-t border-border mt-2 space-y-2">
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
                    {stats?.total_detections ?? "–"} proses
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-sm text-muted-foreground">
                    Deteksi Terakhir
                  </span>
                  <span className="text-sm font-medium text-card-foreground">
                    {stats?.last_detection_date
                      ? new Date(stats.last_detection_date).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "short", year: "numeric" }
                        )
                      : "–"}
                  </span>
                </div>
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
