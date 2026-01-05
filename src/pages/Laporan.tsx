import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2, MapPin, Calendar, User } from "lucide-react";
import detectionPreview from "@/assets/detection-preview.jpg";

const Laporan = () => {
  return (
    <DashboardLayout
      title="Laporan"
      description="Laporan hasil deteksi pohon durian"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-end gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Bagikan
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Unduh PDF
          </Button>
        </div>

        {/* Report Content */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-border p-6 text-center">
            <h2 className="text-xl font-bold text-card-foreground mb-1">
              Laporan Deteksi Pohon Durian
            </h2>
            <p className="text-sm text-muted-foreground">
              Hasil analisis citra drone menggunakan AI
            </p>
          </div>

          {/* Map Preview */}
          <div className="p-6 border-b border-border">
            <div className="relative overflow-hidden rounded-lg border border-border">
              <img
                src={detectionPreview}
                alt="Peta hasil deteksi"
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="absolute bottom-3 left-3 rounded bg-card/90 backdrop-blur-sm px-3 py-2 text-xs shadow">
                <div className="flex items-center gap-4">
                  <span>Skala 1:4.300</span>
                  <span>WGS84</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="p-6 border-b border-border">
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Koordinat: -7.4231°, 109.2378°</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Tanggal: 16 November 2025</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Dibuat oleh: Sandy Tirta Yudha</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Legenda: Pohon Durian</span>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Hasil Deteksi
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Parameter
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      Nilai
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 text-card-foreground">
                      Jumlah Pohon Terdeteksi
                    </td>
                    <td className="py-3 text-right font-semibold text-primary">
                      1,247
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-card-foreground">
                      Tingkat Akurasi
                    </td>
                    <td className="py-3 text-right font-semibold text-card-foreground">
                      93.4%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-card-foreground">Model AI</td>
                    <td className="py-3 text-right font-semibold text-card-foreground">
                      YOLOv11
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-card-foreground">Luas Area</td>
                    <td className="py-3 text-right font-semibold text-card-foreground">
                      45.2 Ha
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-card-foreground">
                      Kepadatan Pohon
                    </td>
                    <td className="py-3 text-right font-semibold text-card-foreground">
                      27.6/Ha
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Download Options */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Button variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Unduh PDF
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Unduh Peta (PNG)
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Unduh Data (CSV)
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Laporan;