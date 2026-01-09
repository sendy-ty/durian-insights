import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Download, Calendar, User } from "lucide-react";
import detectionPreview from "@/assets/detection-preview.jpg";
import { toast } from "@/hooks/use-toast";

interface DetectionData {
  trees: number;
  accuracy: number;
  timestamp: string;
  filename: string;
}

const Laporan = () => {
  const [userName, setUserName] = useState("Pengguna");
  const [detectionData, setDetectionData] = useState<DetectionData | null>(null);
  const [detectionDate, setDetectionDate] = useState("");

  useEffect(() => {
    // Get user name from localStorage
    const user = JSON.parse(localStorage.getItem("duriancount_user") || "{}");
    if (user.name) {
      setUserName(user.name);
    }

    // Get last detection data
    const lastDetection = localStorage.getItem("duriancount_last_detection");
    if (lastDetection) {
      const data = JSON.parse(lastDetection);
      setDetectionData(data);
      setDetectionDate(
        new Date(data.timestamp).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    } else {
      // Default values if no detection yet
      setDetectionData({
        trees: 1247,
        accuracy: 93.4,
        timestamp: new Date().toISOString(),
        filename: "sample.jpg",
      });
      setDetectionDate(
        new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    }
  }, []);

  const handleDownloadPDF = () => {
    toast({
      title: "Download dimulai",
      description: "Mengunduh laporan dalam format PDF...",
    });
  };

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

          {/* Content - flex-1 to fill remaining space */}
          <div className="flex-1 p-4 flex flex-col min-h-0">
            {/* Map Preview - takes most space */}
            <div className="flex-1 min-h-0 mb-4">
              <div className="relative h-full overflow-hidden rounded-lg border border-border">
                <img
                  src={detectionPreview}
                  alt="Peta hasil deteksi"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 rounded bg-card/90 backdrop-blur-sm px-3 py-2 text-xs shadow">
                  <div className="flex items-center gap-4">
                    <span>Skala 1:4.300</span>
                    <span>WGS84</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Grid - compact */}
            <div className="grid gap-3 sm:grid-cols-2 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Tanggal: {detectionDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Dibuat oleh: {userName}</span>
              </div>
            </div>

            {/* Results - compact table */}
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
                      {detectionData?.trees.toLocaleString() || "–"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-card-foreground">
                      Tingkat Akurasi
                    </td>
                    <td className="py-2 px-4 text-right font-semibold text-card-foreground">
                      {detectionData?.accuracy || "–"}%
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
          </div>

          {/* Footer with Download Button - only PDF */}
          <div className="border-t border-border p-4 flex-shrink-0">
            <Button className="w-full" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Unduh Laporan (PDF)
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Laporan;
