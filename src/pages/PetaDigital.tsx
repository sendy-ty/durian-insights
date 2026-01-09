import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  TreeDeciduous,
  MapPin,
  Upload,
  Map,
  CheckCircle2,
  ArrowRight,
  Folder,
  FileImage,
} from "lucide-react";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

type MappingStep = "upload" | "processing" | "ready";

const PetaDigital = () => {
  const [mappingStep, setMappingStep] = useState<MappingStep>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = ".jpg,.jpeg,.png,.zip";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validFiles = Array.from(files).filter((file) => {
        const ext = file.name.toLowerCase().split(".").pop();
        return ["jpg", "jpeg", "png", "zip"].includes(ext || "");
      });

      if (validFiles.length === 0) {
        toast({
          title: "Format tidak didukung",
          description: "Gunakan format JPG, PNG, atau ZIP",
          variant: "destructive",
        });
        return;
      }

      setUploadedFiles(validFiles);
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

  const handleDownload = () => {
    toast({
      title: "Download dimulai",
      description: "Mengunduh peta digital dalam format TIFF...",
    });
  };

  return (
    <DashboardLayout
      title="Peta Digital"
      description="Buat dan lihat peta digital dari citra drone"
    >
      <div className="animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
        {/* Workflow Steps */}
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 shadow-sm mb-6">
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
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm flex-1 flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                Upload Citra Drone
              </h2>
              <p className="text-sm text-muted-foreground">
                Unggah citra udara untuk membuat peta digital dengan ODM
              </p>
            </div>

            {/* Hidden inputs */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={acceptedFormats}
              multiple
              onChange={handleFileUpload}
            />
            <input
              ref={folderInputRef}
              type="file"
              className="hidden"
              accept={acceptedFormats}
              multiple
              {...({ webkitdirectory: "true", directory: "true" } as any)}
              onChange={handleFileUpload}
            />

            {/* Upload area */}
            <div className="flex-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/50">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center font-medium text-card-foreground mb-2">
                Pilih folder atau file citra drone
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Format: JPG, PNG, ZIP
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => folderInputRef.current?.click()}
                >
                  <Folder className="mr-2 h-4 w-4" />
                  Pilih Folder
                </Button>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <FileImage className="mr-2 h-4 w-4" />
                  Pilih File
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Processing Section */}
        {mappingStep === "processing" && (
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm flex-1 flex flex-col items-center justify-center">
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

            <div className="w-full max-w-md space-y-2">
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
          <div className="flex-1 flex flex-col min-h-0">
            {/* Map Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm mb-4">
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
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Peta
                </Button>
                <Button variant="outline" size="sm" onClick={resetUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Baru
                </Button>
                <Button size="sm" asChild>
                  <Link to="/deteksi">
                    Lanjut ke Deteksi
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Full Map View - No sidebar */}
            <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-border">
              <InteractiveMap className="h-full w-full" />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PetaDigital;
