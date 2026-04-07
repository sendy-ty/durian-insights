import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Download, Calendar, User, Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useGenerateReport } from "@/hooks/useReport";
import { useDetectionResults } from "@/hooks/useDetection";
import { useCurrentUser } from "@/hooks/useAuth";
import { useImage } from "@/hooks/useImages";
import { imageService } from "@/services/image.service";

const Laporan = () => {
  const { data: currentUser } = useCurrentUser();
  const userName = currentUser?.name || "Pengguna";

  const generateReport = useGenerateReport();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const storedImageId = searchParams.get("image_id");

  // Fetch detection results and image meta from backend
  const detectionQuery = useDetectionResults(storedImageId, !!storedImageId);
  const imageQuery = useImage(storedImageId);

  useEffect(() => {
    if (!storedImageId) {
      toast({ title: "Peringatan", description: "Citra tidak ditemukan. Silakan proses peta atau deteksi terlebih dahulu.", variant: "destructive" });
      navigate("/peta");
    }
  }, [storedImageId, navigate]);

  // Derive display values from backend data
  const trees = detectionQuery.data?.trees || detectionQuery.data?.count || 0;
  const accuracy = detectionQuery.data?.accuracy || 0;
  const filename = imageQuery.data?.filename || "orthomosaic.tif";
  const uploadDate = imageQuery.data?.upload_date
    ? new Date(imageQuery.data.upload_date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  // Build preview URL from backend
  const previewUrl = storedImageId ? imageService.getPreviewUrl(storedImageId) : null;

  const handleDownloadPDF = async () => {
    if (!storedImageId) return;
    try {
      toast({
        title: "Download dimulai",
        description: "Mengunduh laporan dalam format PDF...",
      });
      const data = await generateReport.mutateAsync(storedImageId);
      if (data?.report_url) {
        window.open(data.report_url, "_blank");
      }
    } catch (err) {
      toast({ title: "Error", description: "Gagal mengunduh laporan", variant: "destructive" });
    }
  };

  const isLoading = detectionQuery.isLoading || imageQuery.isLoading;

  return (
    <DashboardLayout
      title="Laporan"
      description="Laporan hasil deteksi pohon durian"
    >
      <div className="animate-fade-in h-[calc(100vh-8rem)] overflow-hidden">
        {/* Single Page Report Layout */}
        <div className="h-full rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="border-b border-border p-4 text-center flex-shrink-0">
            <h2 className="text-xl font-bold text-card-foreground mb-1">
              Laporan Deteksi Pohon Durian
            </h2>
            <p className="text-sm text-muted-foreground">
              Hasil analisis citra drone menggunakan AI
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col min-h-0">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Memuat data laporan...</p>
                </div>
              </div>
            ) : detectionQuery.isError ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-card-foreground mb-1">Hasil deteksi belum tersedia</p>
                  <p className="text-xs text-muted-foreground mb-4">Jalankan deteksi terlebih dahulu untuk melihat laporan.</p>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/deteksi?image_id=${storedImageId}`)}>
                    Ke Deteksi
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Map Preview */}
                <div className="flex-1 min-h-0 mb-4">
                  <div className="relative h-full overflow-hidden rounded-lg border border-border">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Peta hasil deteksi"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if preview not available
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/30">
                        <p className="text-sm text-muted-foreground">Preview tidak tersedia</p>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 rounded bg-card/90 backdrop-blur-sm px-3 py-2 text-xs shadow">
                      <div className="flex items-center gap-4">
                        <span>File: {filename}</span>
                        <span>WGS84</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid gap-3 sm:grid-cols-2 mb-4 flex-shrink-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Tanggal: {uploadDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Dibuat oleh: {userName}</span>
                  </div>
                </div>

                {/* Results Table */}
                <div className="border border-border rounded-lg overflow-hidden flex-shrink-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-2 px-4 text-left font-medium text-muted-foreground">
                          Parameter
                        </th>
                        <th className="py-2 px-4 text-right font-medium text-muted-foreground">
                          Nilai
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="py-2 px-4 text-card-foreground">
                          Jumlah Pohon Terdeteksi
                        </td>
                        <td className="py-2 px-4 text-right font-semibold text-primary">
                          {trees > 0 ? trees.toLocaleString() : "–"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 text-card-foreground">
                          Tingkat Akurasi
                        </td>
                        <td className="py-2 px-4 text-right font-semibold text-card-foreground">
                          {accuracy > 0 ? `${accuracy}%` : "–"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 text-card-foreground">Model AI</td>
                        <td className="py-2 px-4 text-right font-semibold text-card-foreground">
                          YOLOv11
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4 flex-shrink-0">
            <Button
              className="w-full"
              onClick={handleDownloadPDF}
              disabled={!storedImageId || generateReport.isPending || isLoading}
            >
              {generateReport.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {generateReport.isPending ? "Sedang Mengunduh..." : "Unduh Laporan (PDF)"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Laporan;
