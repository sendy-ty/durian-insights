import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WorkflowSteps } from "@/components/dashboard/WorkflowSteps";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileImage,
  Brain,
  Play,
  CheckCircle2,
  Lightbulb,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const DeteksiPohon = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
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

        // Simulate upload
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsUploading(false);
              setCompletedSteps([1]);
              setCurrentStep(2);
              toast({
                title: "Upload Berhasil",
                description: "File berhasil diunggah dan siap diproses",
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
          setCompletedSteps([1, 2]);
          setCurrentStep(3);
          toast({
            title: "Deteksi Selesai",
            description: "1,247 pohon durian berhasil terdeteksi",
          });
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const resetProcess = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setUploadProgress(0);
    setDetectionProgress(0);
    setUploadedFile(null);
  };

  return (
    <DashboardLayout
      title="Proses Deteksi Pohon"
      description="Deteksi dan hitung pohon durian secara otomatis menggunakan AI"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Workflow Progress */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <WorkflowSteps
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            {currentStep === 1 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-slide-up">
                <h2 className="mb-4 text-lg font-semibold text-card-foreground">
                  Upload Data Drone
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  Unggah citra udara hasil survei drone (JPG, PNG, TIFF, ZIP)
                </p>

                <label
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
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
                      <p className="text-center font-medium text-card-foreground">
                        Drag & drop file atau klik untuk memilih
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Format: JPG, PNG, TIFF, ZIP (Max 500MB)
                      </p>
                    </>
                  )}
                </label>

                {isUploading && (
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Mengupload...
                      </span>
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
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-slide-up">
                <h2 className="mb-4 text-lg font-semibold text-card-foreground">
                  Deteksi AI
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  Jalankan model AI untuk mendeteksi pohon durian
                </p>

                <div className="mb-6 flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <div>
                    <p className="font-medium text-card-foreground">
                      Model: YOLOv8
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fast and accurate detection
                    </p>
                  </div>
                  <Badge>Recommended</Badge>
                </div>

                {isDetecting ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Brain className="h-4 w-4 animate-pulse" />
                        Mendeteksi pohon durian...
                      </span>
                      <span className="font-medium text-card-foreground">
                        {detectionProgress}%
                      </span>
                    </div>
                    <Progress value={detectionProgress} className="h-2" />
                  </div>
                ) : (
                  <Button onClick={startDetection} className="w-full" size="lg">
                    <Play className="mr-2 h-5 w-5" />
                    Mulai Deteksi
                  </Button>
                )}
              </div>
            )}

            {/* Results Section */}
            {currentStep === 3 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-slide-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground">
                      Deteksi Selesai
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Hasil deteksi siap divisualisasikan
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold text-primary">1,247</p>
                    <p className="text-sm text-muted-foreground">
                      Total Pohon
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold text-card-foreground">
                      93.4%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Avg Confidence
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold text-card-foreground">
                      YOLOv8
                    </p>
                    <p className="text-sm text-muted-foreground">Model</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1">Tampilkan di Peta</Button>
                  <Button variant="outline" className="flex-1">
                    Lihat Laporan
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-warning" />
                <h3 className="font-semibold text-card-foreground">Tips</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  Gunakan citra drone dengan resolusi tinggi untuk hasil terbaik
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  YOLOv8 lebih cepat, Faster R-CNN lebih presisi
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  Pastikan format file sesuai (JPG, PNG, TIFF, ZIP)
                </li>
              </ul>
            </div>

            {/* Progress Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-card-foreground">
                Progress Saat Ini
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Upload Data", step: 1 },
                  { label: "Deteksi AI", step: 2 },
                  { label: "Visualisasi Peta", step: 3 },
                  { label: "Laporan Akhir", step: 4 },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        completedSteps.includes(item.step)
                          ? "bg-primary"
                          : currentStep === item.step
                          ? "bg-primary animate-pulse"
                          : "bg-border"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        completedSteps.includes(item.step) ||
                          currentStep === item.step
                          ? "text-card-foreground font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {completedSteps.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={resetProcess}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reset Proses
                </Button>
              )}
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

export default DeteksiPohon;
