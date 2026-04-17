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
  Loader2,
  RefreshCcw,
  Download as DownloadIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { useEffect } from "react";
import { useDetectionResults, useRunDetection } from "@/hooks/useDetection";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import { useMapBounds, useMapDetections, useMapOrthomosaic } from "@/hooks/useMap";
import { getApiErrorMessage, apiClient } from "@/api/client";
import { useUploadImage } from "@/hooks/useImages";

interface DetectionResult {
  trees: number;
  accuracy: number;
  timestamp: string;
  filename: string;
}

const DeteksiPohon = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadImage = useUploadImage();
  const runDetection = useRunDetection();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const storedImageId = searchParams.get("image_id");

  useEffect(() => {
    if (storedImageId) {
      setActiveImageId(storedImageId);
      if (currentStep === 1) setCurrentStep(2);
    }
  }, [storedImageId]);

  useEffect(() => {
    console.log("IMAGE ID:", activeImageId);
    console.log("STEP:", currentStep);
  }, [activeImageId, currentStep]);

  // Use unified task status polling via useTaskStatus
  const statusQuery = useTaskStatus(taskId, currentStep === 2 ? 3000 : undefined);

  const isFinished = statusQuery.data?.status === "SUCCESS" || statusQuery.data?.status === "COMPLETED"
    || statusQuery.data?.status?.toLowerCase() === "completed" || statusQuery.data?.status?.toLowerCase() === "success";
  const isFailed = statusQuery.data?.status === "FAILED" || statusQuery.data?.status?.toLowerCase() === "failed";

  const resultQuery = useDetectionResults(activeImageId, isFinished);

  // Map data for results view
  const boundsQuery = useMapBounds(activeImageId, currentStep === 3);
  const orthomosaicQuery = useMapOrthomosaic(activeImageId, currentStep === 3);
  const detectionsQuery = useMapDetections(activeImageId, currentStep === 3);

  // Track task status changes
  useEffect(() => {
    if (statusQuery.data) {
      if (statusQuery.data.progress != null) {
        setDetectionProgress(statusQuery.data.progress);
      }

      if (isFinished) {
        setDetectionProgress(100);
        setIsDetecting(false);
        setCurrentStep(3);
      } else if (isFailed) {
        const errorMsg = statusQuery.data.error || "Proses deteksi gagal. Coba lagi.";
        toast({ title: "Error", description: errorMsg, variant: "destructive" });
        setIsDetecting(false);
        setTaskId(null);
        setCurrentStep(1);
      }
    }
  }, [statusQuery.data, isFinished, isFailed]);

  // When results are ready, compile detection summary
  useEffect(() => {
    if (currentStep === 3 && resultQuery.data) {
      const data = resultQuery.data;
      const result: DetectionResult = {
        trees: data.trees || data.count || 0,
        accuracy: data.accuracy || 95.0,
        timestamp: new Date().toISOString(),
        filename: uploadedFile?.name || "orthomosaic.tif",
      };
      setDetectionResult(result);
      localStorage.setItem("duriancount_last_detection", JSON.stringify(result));
    }
  }, [currentStep, resultQuery.data]);

  const cancelUpload = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadedFile(null);
      console.log("UPLOAD CANCELLED");
      toast({ title: "Upload dibatalkan" });
    }
  }, [abortController, toast]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || isUploading) return;

      const ext = file.name.toLowerCase().split(".").pop();
      if (!["jpg", "jpeg", "png", "tiff", "tif"].includes(ext || "")) {
        toast({
          title: "Format tidak didukung",
          description: "Gunakan format JPG, PNG, atau TIFF",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
      setIsUploading(true);
      setUploadProgress(0);

      const controller = new AbortController();
      setAbortController(controller);

      try {
        const response = await uploadImage.mutateAsync({
          file,
          onProgress: (percent) => setUploadProgress(percent),
          signal: controller.signal,
        });

        console.log("UPLOAD success:", response);
        const imgId = response.image_id;

        if (imgId) {
          setActiveImageId(imgId);
          setSearchParams({ image_id: imgId });
          setCurrentStep(2);
          toast({ title: "Upload selesai", description: "File siap untuk diproses" });
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
          console.log("File upload aborted by user.");
          return;
        }
        toast({ title: "Upload gagal", description: getApiErrorMessage(err), variant: "destructive" });
      } finally {
        setIsUploading(false);
        setAbortController(null);
      }
    },
    [toast, uploadImage, setSearchParams, isUploading]
  );

  const startDetection = async () => {
    if (!activeImageId || isDetecting || runDetection.isPending) return;
    setIsDetecting(true);
    setDetectionProgress(0);
    try {
      const result = await runDetection.mutateAsync(activeImageId);

      console.log("TASK:", result);

      const tid = result?.data?.data?.task_id || result?.data?.task_id || result?.task_id || (result as any)?.task_id;

      if (!tid) {
        toast({ title: "Gagal memulai deteksi", description: "Obyek task_id API tidak valid.", variant: "destructive" });
        setIsDetecting(false);
        return;
      }

      setTaskId(tid);
    } catch (err) {
      toast({
        title: "Gagal memulai deteksi",
        description: getApiErrorMessage(err, "Periksa koneksi API Anda."),
        variant: "destructive"
      });
      setIsDetecting(false);
    }
  };

  useEffect(() => {
    if (statusQuery.data) {
      console.log("STATUS:", statusQuery.data);
    }
  }, [statusQuery.data]);

  useEffect(() => {
    if (resultQuery.data) {
      const bboxes = resultQuery.data?.data?.bboxes || resultQuery.data?.bboxes || [];
      console.log("RESULT (bboxes):", bboxes);
    }
  }, [resultQuery.data]);

  const resetProcess = () => {
    setCurrentStep(1);
    setUploadProgress(0);
    setDetectionProgress(0);
    setUploadedFile(null);
    setDetectionResult(null);
    setTaskId(null);
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
                accept=".jpg,.jpeg,.png,.tiff,.tif"
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
                    Format: JPG, PNG, TIFF
                  </p>
                </>
              )}
            </label>

            {isUploading && (
              <div className="mt-6 space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Mengupload file...</span>
                    <span className="font-bold text-primary">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
                <Button variant="outline" size="sm" onClick={cancelUpload} className="w-full border-red-200 text-red-600 hover:bg-red-50">
                  <X className="mr-2 h-4 w-4" />
                  Batalkan Upload
                </Button>
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

            {isDetecting || runDetection.isPending ? (
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-center gap-3 text-primary">
                  {runDetection.isPending ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Brain className="h-6 w-6 animate-pulse" />
                  )}
                  <span className="font-medium">
                    {runDetection.isPending ? "Memulai model deteksi..." : "Mendeteksi pohon..."}
                  </span>
                </div>
                <div className="space-y-2">
                  <Progress value={detectionProgress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground">
                    {detectionProgress}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex flex-col gap-3">
                  <Button onClick={startDetection} className="w-full" size="lg" disabled={!activeImageId}>
                    <Play className="mr-2 h-5 w-5" />
                    Mulai Deteksi Sekarang
                  </Button>
                  <Button variant="outline" onClick={resetProcess} className="w-full" size="lg">
                    <X className="mr-2 h-4 w-4" />
                    Batal & Pilih Gambar Lain
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Section with Interactive Map Preview */}
        {currentStep === 3 && detectionResult && (
          <div className="space-y-6">
            {/* Interactive Map Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                Preview Detail Deteksi
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="relative rounded-xl border border-border bg-card overflow-hidden shadow-lg group">
                  <img
                    src={`${apiClient.defaults.baseURL}/images/${activeImageId}/annotated`}
                    alt="Annotated Trees"
                    className="w-full h-auto object-contain max-h-[600px] transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-mono border border-white/10">
                    Annotated View
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg h-[400px] lg:h-auto">
                   <InteractiveMap
                    className="h-full w-full"
                    imageUrl={orthomosaicQuery.data?.image_url}
                    imageBounds={boundsQuery.data || orthomosaicQuery.data?.bounds}
                    geojsonData={detectionsQuery.data}
                  />
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center">
                <p className="text-3xl font-bold text-primary mb-1">
                  {(resultQuery.data?.data?.bboxes?.length || resultQuery.data?.bboxes?.length || 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Pohon (BBox)</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center">
                <p className="text-3xl font-bold text-card-foreground mb-1">
                  {detectionResult.accuracy}%
                </p>
                <p className="text-sm text-muted-foreground">Akurasi AI</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center">
                <p className="text-3xl font-bold text-card-foreground mb-1">
                  YOLOv11
                </p>
                <p className="text-sm text-muted-foreground">Model Deteksi</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button size="lg" asChild className="bg-green-600 hover:bg-green-700 text-white border-none shadow-md">
                <a 
                  href={`${apiClient.defaults.baseURL}/images/${activeImageId}/annotated`} 
                  download={`annotated_${activeImageId}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <DownloadIcon className="mr-2 h-5 w-5" />
                  Download Annotated
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={`/laporan?image_id=${activeImageId}`}>
                  <FileText className="mr-2 h-5 w-5" />
                  Lihat Laporan
                </Link>
              </Button>
              <Button size="lg" variant="outline" onClick={resetProcess}>
                <RefreshCcw className="mr-2 h-5 w-5" />
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
