import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  Printer,
  Share2,
  TreeDeciduous,
  MapPin,
  Target,
  Calendar,
  User,
} from "lucide-react";
import detectionPreview from "@/assets/detection-preview.jpg";

const Laporan = () => {
  return (
    <DashboardLayout
      title="Laporan Akhir"
      description="Laporan hasil deteksi pohon durian dalam format PDF"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <FileText className="mr-1 h-3 w-3" />
              Format PDF
            </Badge>
            <Badge variant="secondary">
              <Calendar className="mr-1 h-3 w-3" />
              16 November 2025
            </Badge>
          </div>
          <div className="flex items-center gap-2">
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
              Unduh Laporan PDF
            </Button>
          </div>
        </div>

        {/* Report Preview */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Report */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Header */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-card-foreground mb-2">
                  PETA SEBARAN POHON DURIAN HASIL DETEKSI AI
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sistem Deteksi dan Perhitungan Pohon Durian Otomatis
                </p>
              </div>

              {/* Map Preview */}
              <div className="relative overflow-hidden rounded-lg border border-border mb-6">
                <img
                  src={detectionPreview}
                  alt="Peta hasil deteksi"
                  className="w-full aspect-[16/10] object-cover"
                />
                <div className="absolute bottom-3 left-3 rounded bg-card/90 backdrop-blur-sm px-3 py-2 text-xs shadow">
                  <div className="flex items-center gap-4">
                    <span>Skala 1:4.300</span>
                    <span>WGS84 / UTM Zona 50S</span>
                  </div>
                </div>
              </div>

              {/* Map Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Koordinat: -7.4231°, 109.2378°</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Tanggal: 16 November 2025</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Dibuat: Sandy Tirta Yudha</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-4 w-4 rounded-full bg-primary inline-block" />
                    <span>Legenda: Pohon Durian</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detection Results Table */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Laporan Deteksi Pohon Durian
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Format PDF dengan peta ortomosaik
              </p>

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
                        Jumlah Total Pohon
                      </td>
                      <td className="py-3 text-right font-semibold text-primary">
                        1,247
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-card-foreground">
                        Rata-rata Akurasi
                      </td>
                      <td className="py-3 text-right font-semibold text-card-foreground">
                        93.4%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-card-foreground">Model AI</td>
                      <td className="py-3 text-right font-semibold text-card-foreground">
                        YOLOv8
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

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-card-foreground">
                Ringkasan Deteksi
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10">
                  <TreeDeciduous className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-primary">1,247</p>
                    <p className="text-sm text-muted-foreground">
                      Pohon Terdeteksi
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Target className="h-8 w-8 text-card-foreground" />
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      93.4%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tingkat Akurasi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Options */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-card-foreground">
                Unduh Laporan
              </h3>
              <div className="space-y-3">
                <Button className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Unduh Laporan PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Unduh Peta (PNG)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Unduh Data (CSV)
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-card-foreground">
                Aksi Lainnya
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Lihat Peta
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Proses Baru
                </Button>
              </div>
            </div>
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

export default Laporan;
