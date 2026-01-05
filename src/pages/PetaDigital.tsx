import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MapPreview } from "@/components/dashboard/MapPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  TreeDeciduous,
  MapPin,
} from "lucide-react";
import detectionPreview from "@/assets/detection-preview.jpg";

const PetaDigital = () => {
  return (
    <DashboardLayout
      title="Peta Digital"
      description="Visualisasi hasil deteksi pohon durian pada peta georeferensi"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Map Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <MapPin className="mr-1 h-3 w-3" />
              -7.4231°, 109.2378°
            </Badge>
            <Badge variant="secondary">
              <TreeDeciduous className="mr-1 h-3 w-3" />
              1,247 pohon terdeteksi
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Layers className="mr-2 h-4 w-4" />
              Layer
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Bagikan
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Ekspor
            </Button>
          </div>
        </div>

        {/* Main Map View */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Full Map */}
          <div className="lg:col-span-3">
            <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {/* Map Container */}
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <img
                  src={detectionPreview}
                  alt="Peta deteksi pohon durian"
                  className="h-full w-full object-cover"
                />

                {/* Map Controls */}
                <div className="absolute right-4 top-4 flex flex-col gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-10 w-10 bg-card/95 backdrop-blur-sm shadow-md"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-10 w-10 bg-card/95 backdrop-blur-sm shadow-md"
                  >
                    <ZoomOut className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-10 w-10 bg-card/95 backdrop-blur-sm shadow-md"
                  >
                    <Maximize2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Scale Bar */}
                <div className="absolute bottom-4 left-4 rounded-lg bg-card/95 backdrop-blur-sm p-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-24 rounded bg-foreground/80" />
                    <span className="text-xs font-medium text-card-foreground">
                      100m
                    </span>
                  </div>
                </div>
              </div>

              {/* Map Footer */}
              <div className="border-t border-border bg-muted/30 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Skala 1:4.300</span>
                    <span>WGS84 / UTM Zona 50S</span>
                    <span>Tanggal: 16 November 2025</span>
                  </div>
                  <span>Sumber: OpenArielMap</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Legend */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="mb-4 font-semibold text-card-foreground">
                Legenda
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-primary" />
                  <span className="text-sm text-card-foreground">
                    Pohon Durian
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded border-2 border-primary/50 bg-primary/20" />
                  <span className="text-sm text-card-foreground">
                    Area Deteksi
                  </span>
                </div>
              </div>
            </div>

            {/* Detection Stats */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="mb-4 font-semibold text-card-foreground">
                Statistik Deteksi
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Pohon
                  </span>
                  <span className="font-semibold text-primary">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Luas Area
                  </span>
                  <span className="font-medium text-card-foreground">
                    45.2 Ha
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Kepadatan
                  </span>
                  <span className="font-medium text-card-foreground">
                    27.6/Ha
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Confidence
                  </span>
                  <span className="font-medium text-primary">93.4%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="mb-4 font-semibold text-card-foreground">
                Aksi Cepat
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Unduh Peta (PDF)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Unduh GeoJSON
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="mr-2 h-4 w-4" />
                  Bagikan Link
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

export default PetaDigital;
