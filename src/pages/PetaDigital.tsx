import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Layers,
  Download,
  Share2,
  TreeDeciduous,
  MapPin,
  Upload,
  Map,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type MappingStep = "upload" | "processing" | "ready";

const PetaDigital = () => {
  const [mappingStep, setMappingStep] = useState<MappingStep>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFiles(Array.from(files));
      // Simulate processing
      setMappingStep("processing");
      setProcessingProgress(0);

      const interval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setMappingStep("ready");
            return 100;
          }
          return prev + 5;
        });
      }, 200);
    }
  };

  const resetUpload = () => {
    setMappingStep("upload");
    setUploadedFiles([]);
    setProcessingProgress(0);
  };

  return (
    <DashboardLayout
      title="Peta Digital"
      description="Buat dan lihat peta digital dari citra drone"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Workflow Steps */}
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              mappingStep === "upload"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                mappingStep === "upload"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary text-primary-foreground"
              )}
            >
              {mappingStep === "upload" ? (
                "1"
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
            <span className="text-sm font-medium">Upload Citra</span>
          </div>

          <div className="h-px w-8 bg-border" />

          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              mappingStep === "processing"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                mappingStep === "processing"
                  ? "bg-primary text-primary-foreground"
                  : mappingStep === "ready"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {mappingStep === "ready" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                "2"
              )}
            </div>
            <span className="text-sm font-medium">Proses Pemetaan</span>
          </div>

          <div className="h-px w-8 bg-border" />

          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              mappingStep === "ready"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                mappingStep === "ready"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              3
            </div>
            <span className="text-sm font-medium">Peta Siap</span>
          </div>
        </div>

        {/* Upload Section */}
        {mappingStep === "upload" && (
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                Upload Citra Drone
              </h2>
              <p className="text-sm text-muted-foreground">
                Unggah citra udara untuk membuat peta digital dengan ODM
              </p>
            </div>

            <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 transition-colors cursor-pointer hover:border-primary/50 hover:bg-muted/50">
              <input
                type="file"
                className="hidden"
                accept="image/*,.zip"
                multiple
                onChange={handleFileUpload}
              />
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center font-medium text-card-foreground mb-2">
                Pilih atau seret file ke sini
              </p>
              <p className="text-sm text-muted-foreground">
                Format: JPG, PNG, TIFF (beberapa file direkomendasikan)
              </p>
            </label>
          </div>
        )}

        {/* Processing Section */}
        {mappingStep === "processing" && (
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                <Map className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                Membuat Peta Digital
              </h2>
              <p className="text-sm text-muted-foreground">
                Memproses {uploadedFiles.length} citra dengan OpenDroneMap
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Memproses citra...
                </span>
                <span className="font-medium text-card-foreground">
                  {processingProgress}%
                </span>
              </div>
              <Progress value={processingProgress} className="h-2" />
            </div>
          </div>
        )}

        {/* Map Ready Section */}
        {mappingStep === "ready" && (
          <>
            {/* Map Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  <MapPin className="mr-1 h-3 w-3" />
                  -7.4231°, 109.2378°
                </Badge>
                <Badge variant="secondary">
                  <TreeDeciduous className="mr-1 h-3 w-3" />
                  1,247 pohon
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
                <Button variant="outline" size="sm" onClick={resetUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Baru
                </Button>
              </div>
            </div>

            {/* Main Map View */}
            <div className="grid gap-6 lg:grid-cols-4">
            {/* Full Map - Interactive */}
            <div className="lg:col-span-3">
              <InteractiveMap className="aspect-[16/9]" />
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
                    Ringkasan
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Pohon
                      </span>
                      <span className="font-semibold text-primary">1,247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Luas
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
                  </div>
                </div>

                {/* CTA */}
                <Button className="w-full" asChild>
                  <Link to="/deteksi">
                    Lanjut ke Deteksi Pohon
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PetaDigital;