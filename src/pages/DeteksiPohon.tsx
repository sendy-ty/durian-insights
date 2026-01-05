import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileImage,
  Brain,
  Play,
  CheckCircle2,
  X,
  Map,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { InteractiveMap } from "@/components/map/InteractiveMap";

const DeteksiPohon = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setUploadedFile(file);
        setIsUploading(true);
        setUploadProgress(0);

        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsUploading(false);
              setCurrentStep(2);
              toast({
                title: "Upload selesai",
                description: "File siap untuk diproses",
              });
              return 100;
            }
            return prev + 10;
          });
        }, 200);
      }
    },
    [toast]
  );

  const startDetection = () => {
    setIsDetecting(true);
    setDetectionProgress(0);

    const interval = setInterval(() => {
      setDetectionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDetecting(false);
          setCurrentStep(3);
          toast({
            title: "Deteksi selesai",
            description: "1,247 pohon durian terdeteksi",
          });
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const resetProcess = () => {
    setCurrentStep(1);
    setUploadProgress(0);
    setDetectionProgress(0);
    setUploadedFile(null);
  };

  return (
    <DashboardLayout
      title="Deteksi Pohon"
      description="Deteksi pohon durian dari citra drone menggunakan AI"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              currentStep === 1
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                currentStep >= 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {currentStep > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
            </div>
            <span className="text-sm font-medium">Upload</span>
          </div>

          <div className="h-px w-8 bg-border" />

          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              currentStep === 2
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                currentStep >= 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {currentStep > 2 ? <CheckCircle2 className="h-4 w-4" /> : "2"}
            </div>
            <span className="text-sm font-medium">Deteksi AI</span>
          </div>

          <div className="h-px w-8 bg-border" />

          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              currentStep === 3
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                currentStep >= 3
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              3
            </div>
            <span className="text-sm font-medium">Hasil</span>
          </div>
        </div>

        {/* Upload Section */}
        {currentStep === 1 && (
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                Upload Citra Drone
              </h2>
              <p className="text-sm text-muted-foreground">
                Pilih file orthomosaic atau citra udara untuk deteksi pohon
              </p>
            </div>

            <label
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors cursor-pointer",
                uploadedFile
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <input
                type="file"
                className="hidden"
                accept="image/*,.zip,.tiff"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              {uploadedFile ? (
                <div className="text-center">
                  <FileImage className="mx-auto h-12 w-12 text-primary mb-3" />
                  <p className="font-medium text-card-foreground">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-center font-medium text-card-foreground mb-2">
                    Pilih atau seret file ke sini
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Format: JPG, PNG, TIFF, ZIP (maks 500MB)
                  </p>
                </>
              )}
            </label>

            {isUploading && (
              <div className="mt-6 space-y-2 max-w-md mx-auto">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mengupload...</span>
                  <span className="font-medium text-card-foreground">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        )}

        {/* Detection Section */}
        {currentStep === 2 && (
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                Jalankan Deteksi
              </h2>
              <p className="text-sm text-muted-foreground">
                Model YOLOv11 akan mendeteksi pohon durian pada citra
              </p>
            </div>

            {isDetecting ? (
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-center gap-3 text-primary">
                  <Brain className="h-6 w-6 animate-pulse" />
                  <span className="font-medium">Mendeteksi pohon...</span>
                </div>
                <div className="space-y-2">
                  <Progress value={detectionProgress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground">
                    {detectionProgress}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <Button onClick={startDetection} className="w-full" size="lg">
                  <Play className="mr-2 h-5 w-5" />
                  Mulai Deteksi
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Results Section with Interactive Map Preview */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Interactive Map Preview */}
            <InteractiveMap className="aspect-[21/9]" />

            {/* Results Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center">
                <p className="text-3xl font-bold text-primary mb-1">1,247</p>
                <p className="text-sm text-muted-foreground">Pohon Terdeteksi</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center">
                <p className="text-3xl font-bold text-card-foreground mb-1">
                  93.4%
                </p>
                <p className="text-sm text-muted-foreground">Akurasi</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center">
                <p className="text-3xl font-bold text-card-foreground mb-1">
                  YOLOv11
                </p>
                <p className="text-sm text-muted-foreground">Model</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button size="lg" asChild>
                <Link to="/peta">
                  <Map className="mr-2 h-5 w-5" />
                  Lihat Peta
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/laporan">
                  <FileText className="mr-2 h-5 w-5" />
                  Lihat Laporan
                </Link>
              </Button>
              <Button size="lg" variant="outline" onClick={resetProcess}>
                <X className="mr-2 h-5 w-5" />
                Deteksi Baru
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DeteksiPohon;