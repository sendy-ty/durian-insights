import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  UploadCloud,
  Layers,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RefreshCcw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useAuth";

import {
  useUploadFeature,
  useRunDetectionFeature,
  useFeatureDetectionStatus,
  useFeatureDetectionResults,
} from "./useDetection";
import { newDetectionService } from "./detection.service";

/** Validate PDF with HEAD + GET fallback and retry to beat race conditions. */
async function validatePDFWithRetry(url: string, retries = 5, delay = 1000): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Checking PDF attempt ${i + 1}`);

      // Step 1: HEAD request (fastest, no download)
      let res = await fetch(url, { method: "HEAD" });

      // Step 2: GET fallback if HEAD is blocked by the server
      if (!res.ok) {
        res = await fetch(url, {
          method: "GET",
          headers: { Range: "bytes=0-1" } // fetch only 1 byte — very lightweight
        });
      }

      if (res.ok) {
        console.log("PDF READY ✅");
        return true;
      }
    } catch (err) {
      console.warn(`PDF check failed, retrying... (${i + 1}/${retries})`);
    }

    await new Promise((r) => setTimeout(r, delay));
  }

  console.error("PDF NOT READY ❌");
  return false;
}

const DetectionPage = () => {
  const { data: currentUser } = useCurrentUser();
  const userKey = currentUser?.email || currentUser?.name || "guest";
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const odmImageId = searchParams.get("image_id");

  const [step, setStep] = useState(1);
  const [imageId, setImageId] = useState<string | null>(odmImageId || null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Simulated progress for better UX
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const detectionSectionRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Tools
  const uploadFeature = useUploadFeature();
  const runFeature = useRunDetectionFeature();

  // Task Recovery on Mount with 10-minute expiration check
  useEffect(() => {
    const savedTaskId = localStorage.getItem("pending_detection_task");
    const savedImageId = localStorage.getItem("pending_detection_image");
    const savedTime = localStorage.getItem("pending_detection_time");

    if (savedTaskId && savedImageId && savedTime) {
      const startTimeParsed = parseInt(savedTime, 10);
      const isStale = Date.now() - startTimeParsed > 600000; // 10 minutes

      if (isStale) {
        localStorage.removeItem("pending_detection_task");
        localStorage.removeItem("pending_detection_image");
        localStorage.removeItem("pending_detection_time");
        return;
      }

      setTaskId(savedTaskId);
      setImageId(savedImageId);
      setStep(2);
      setIsProcessing(true);
      setStartTime(startTimeParsed);
      toast({ title: "Melanjutkan Deteksi", description: "Menghubungkan kembali ke proses sebelumnya." });
    } else if (odmImageId) {
      setImageId(odmImageId);
      setStep(2);
    }
  }, [odmImageId]);

  // Handle auto-scroll when image is uploaded
  useEffect(() => {
    if (imageId && step === 1 && !taskId) {
      detectionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [imageId, step, taskId]);

  const [isVisible, setIsVisible] = useState(document.visibilityState === "visible");

  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Polling
  const statusQuery = useFeatureDetectionStatus(taskId, isVisible);
  const statusData = statusQuery.data?.data || statusQuery.data;
  const currentStatus = String(statusData?.status || "pending").toLowerCase();

  const isFinished = currentStatus === "completed" || currentStatus === "success";
  const isFailed = currentStatus === "failed" || statusQuery.isError || currentStatus === "not_found";

  const resultsQuery = useFeatureDetectionResults(imageId, isFinished, isVisible);

  const isResultsReady = resultsQuery.data?.status === "success" || resultsQuery.data?.status === "completed";
  const isTrulyDone = isFinished && isResultsReady;

  useEffect(() => {
    if (currentStatus === "not_found" && taskId) {
      localStorage.removeItem("pending_detection_task");
      localStorage.removeItem("pending_detection_image");
      localStorage.removeItem("pending_detection_time");
      setTaskId(null);
      setIsProcessing(false);
      toast({
        title: "Tugas Tidak Ditemukan",
        description: "Task ID tidak valid atau sudah kadaluarsa.",
        variant: "destructive"
      });
    }
  }, [currentStatus, taskId]);

  // Timeout Guard (60s)
  useEffect(() => {
    if (isProcessing && startTime && !isTrulyDone) {
      const checkTimeout = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 60000) {
          setIsTimedOut(true);
          toast({
            title: "Proses Melebihi Waktu",
            description: "AI masih bekerja di background. Cek hasil secara manual.",
            variant: "default"
          });
          clearInterval(checkTimeout);
        }
      }, 1000);
      return () => clearInterval(checkTimeout);
    }
  }, [isProcessing, startTime, isTrulyDone]);

  useEffect(() => {
    if (isTrulyDone && taskId) {
      setSimulatedProgress(100);
      localStorage.removeItem("pending_detection_task");
      localStorage.removeItem("pending_detection_image");
      localStorage.removeItem("pending_detection_time");

      const timer = setTimeout(() => {
        setIsProcessing(false);
        setIsTimedOut(false);
        setStep(3);
        toast({ title: "Proses Selesai", description: "Jumlah pohon berhasil dihitung." });
      }, 500);

      return () => clearTimeout(timer);
    } else if (isFailed && taskId) {
      setIsProcessing(false);
      setSimulatedProgress(0);
      localStorage.removeItem("pending_detection_task");
      localStorage.removeItem("pending_detection_image");
      localStorage.removeItem("pending_detection_time");
      toast({ title: "Deteksi Gagal", description: "Terjadi kesalahan saat memproses.", variant: "destructive" });
      setTaskId(null);
    }
  }, [isTrulyDone, isFailed, taskId]);

  // Simulation Logic
  useEffect(() => {
    if (isProcessing && simulatedProgress < 90) {
      if (!progressIntervalRef.current) {
        progressIntervalRef.current = setInterval(() => {
          setSimulatedProgress((prev) => {
            const increment = Math.floor(Math.random() * 3) + 1; // 1-3%
            const next = prev + increment;
            if (next >= 90) {
              if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
              return 90;
            }
            return next;
          });
        }, 300);
      }
    } else if (!isProcessing) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isProcessing, simulatedProgress]);

  // Actions
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadPercent(0);
      toast({ title: "Mengunggah...", description: "Harap tunggu sembari gambar diunggah." });

      const result = await uploadFeature.mutateAsync({
        file,
        onProgress: (percent) => setUploadPercent(percent)
      });

      const newImageId = result?.image_id;

      if (newImageId && result?.status === "success") {
        setImageId(newImageId);
        setUploadedFile({ name: file.name, size: file.size });
        setSearchParams({ image_id: newImageId });
        // Stay on step 1 to show the "Mulai Deteksi" button
        toast({ title: "Citra berhasil diupload", description: "Klik tombol 'Mulai Deteksi' untuk melanjutkan." });
      } else {
        throw new Error(result?.message || "ID gambar tidak ditemukan dari server");
      }
    } catch (err: any) {
      toast({ title: "Upload Gagal", description: err.message || "Terjadi kesalahan.", variant: "destructive" });
    }
  };

  const handleStartDetection = async () => {
    if (!imageId) return;
    try {
      const result = await runFeature.mutateAsync(imageId);
      const newTaskId = result?.data?.task_id || result?.task_id;

      if (newTaskId) {
        setTaskId(newTaskId);
        // Persist for recovery
        const now = Date.now();
        localStorage.setItem("pending_detection_task", newTaskId);
        localStorage.setItem("pending_detection_image", imageId);
        localStorage.setItem("pending_detection_time", now.toString());

        setStep(2);
        setSimulatedProgress(5);
        setIsProcessing(true);
        setIsTimedOut(false);
        setStartTime(now); // Start timer
        toast({ title: "Proses Dimulai", description: "AI sedang menganalisis pohon durian." });
      } else {
        throw new Error("Task ID tidak valid.");
      }
    } catch (err: any) {
      toast({ title: "Gagal Memulai", description: err.message, variant: "destructive" });
    }
  };

  // Rendering helpers
  const results = resultsQuery.data;
  const treeCount = results?.tree_count ?? 0;
  const detections = Array.isArray(results?.detections) ? results.detections : [];

  // Direct URL from backend results or fallback to static pattern
  const annotatedUrl = results?.annotated_url || (imageId ? newDetectionService.getAnnotatedImageUrl(imageId) : null);

  const handleGenerateReport = async () => {
    if (!imageId) {
      toast({ title: "Error", description: "Image ID tidak ditemukan.", variant: "destructive" });
      return;
    }

    // ⚡ Pre-open tab synchronously inside the click event — bypasses popup blockers
    const newTab = window.open("", "_blank");

    try {
      setIsGeneratingReport(true);

      // Initialize the core toast that we will update throughout the flow
      const activeToast = toast({
        title: "Membuat Laporan...",
        description: "Sedang menyusun data deteksi Anda."
      });

      // Step 1: Call backend — service throws if URL is missing
      const { reportUrl } = await newDetectionService.generateReport(imageId);

      if (!reportUrl) throw new Error("URL laporan kosong");

      console.log("FINAL REPORT URL:", reportUrl);

      // Step 2: Update same toast for validation phase
      if (isMounted.current) {
        activeToast.update({
          ...activeToast,
          title: "Menyiapkan laporan PDF...",
          description: "Memverifikasi ketersediaan file di server."
        });
      }

      const isValid = await validatePDFWithRetry(reportUrl);

      if (!isValid) throw new Error("File PDF belum tersedia di server setelah beberapa percobaan.");

      // Step 3: Navigate the pre-opened tab to the real PDF URL
      if (newTab) {
        newTab.location.href = reportUrl;
      } else {
        // Fallback: browser closed the blank tab (rare), try again
        window.open(reportUrl, "_blank");
      }

      // Step 4: Persist with user-scoped key + rich metadata
      const reportMeta = {
        url: reportUrl,
        treeCount,
        fileName: uploadedFile?.name || "image.tif",
        generatedAt: new Date().toISOString()
      };
      const storageKey = userKey ? `lastReport_${userKey}` : "lastReport";
      localStorage.setItem(storageKey, JSON.stringify(reportMeta));

      // Step 5: Final success update
      if (isMounted.current) {
        activeToast.update({
          ...activeToast,
          title: "Laporan Berhasil Dibuat",
          description: "PDF dibuka di tab baru."
        });
      }

      navigate("/laporan", { state: { reportUrl, reportMeta } });

    } catch (err: any) {
      // Close the orphan blank tab so the user isn't left with an empty tab
      if (newTab) newTab.close();

      console.error("REPORT ERROR:", err);
      if (isMounted.current) {
        toast({
          title: "Gagal Generate Laporan",
          description: err.message || "PDF tidak tersedia di server.",
          variant: "destructive"
        });
      }
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom sensitivity logic (deltaY < 0 is zoom in)
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setScale((prev) => {
      const next = prev + delta;
      return Math.min(Math.max(next, 0.5), 5);
    });
  };

  useEffect(() => {
    if (step === 3) {
      console.log("RESULT DATA:", results);
      console.log("ANNOTATED URL:", annotatedUrl);
    }
  }, [step, results, annotatedUrl]);

  return (
    <DashboardLayout title="Deteksi Pohon" description="Hitung jumlah pohon durian secara otomatis dari foto drone">
      <div className="w-full max-w-6xl mx-auto px-6 space-y-6 mt-6 animate-fade-in transition-colors">

        {/* STEPPER */}
        <div className="flex items-center justify-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm mb-6 transition-colors">
          <div className={cn("px-4 py-2 rounded-lg font-bold transition-all", step === 1 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "text-gray-400 dark:text-gray-500")}>
            1. Unggah Foto
          </div>
          <div className="h-[2px] w-8 bg-gray-100 dark:bg-gray-700"></div>
          <div className={cn("px-4 py-2 rounded-lg font-bold transition-all", step === 2 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "text-gray-400 dark:text-gray-500")}>
            2. Proses Perhitungan
          </div>
          <div className="h-[2px] w-8 bg-gray-100 dark:bg-gray-700"></div>
          <div className={cn("px-4 py-2 rounded-lg font-bold transition-all", step === 3 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "text-gray-400 dark:text-gray-500")}>
            3. Hasil Perhitungan
          </div>
        </div>

        {/* STEP 1: UPLOAD */}
        {step === 1 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <UploadCloud className="h-5 w-5 text-green-600 dark:text-green-500" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Unggah Citra</h2>
            </div>

            <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl transition-colors">
              {uploadFeature.isPending ? (
                <div className="flex flex-col items-center space-y-4 w-full max-w-md px-8">
                  <div className="relative flex items-center justify-center">
                    <Loader2 className="h-12 w-12 text-green-600 dark:text-green-500 animate-spin" />
                    <span className="absolute text-[10px] font-bold text-green-700 dark:text-green-400">{uploadPercent}%</span>
                  </div>
                  <div className="w-full space-y-2">
                    <Progress value={uploadPercent} className="h-2 bg-gray-200 dark:bg-gray-700" />
                    <p className="text-green-600 dark:text-green-500 font-medium text-center animate-pulse">Mengunggah Foto, mohon tunggu ({uploadPercent}%)...</p>
                  </div>
                </div>
              ) : imageId && uploadedFile ? (
                <div className="flex flex-col items-center space-y-6 w-full py-4 transition-all">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-2xl p-8 flex flex-col items-center gap-4 w-full max-w-lg mb-4">
                    <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-500" />
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-800 dark:text-green-200 truncate max-w-xs">{uploadedFile.name}</p>
                      <p className="text-sm text-green-600/70 dark:text-green-400/70 font-medium">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div ref={detectionSectionRef} className="flex flex-col gap-3 w-full max-w-xs">
                    <Button
                      onClick={handleStartDetection}
                      disabled={runFeature.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold h-14 text-lg rounded-xl shadow-md transition-all active:scale-95"
                    >
                      {runFeature.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5 fill-current" />}
                      Mulai Hitung Pohon
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => { setImageId(null); setUploadedFile(null); }}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4 text-center p-8">
                  <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full transition-colors">
                    <ImageIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">Pilih atau seret foto Anda ke sini</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Format file: JPG, PNG, TIFF (maks. 2GB)</p>
                  </div>
                  <input type="file" id="upload-file" className="hidden" accept=".jpg,.jpeg,.png,.tif,.tiff" onChange={handleUpload} />
                  <Button
                    onClick={() => document.getElementById("upload-file")?.click()}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm px-8"
                  >
                    Pilih File
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: PROCESS */}
        {step === 2 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-5 w-5 text-green-600 dark:text-green-500" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Proses Perhitungan Pohon</h2>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col space-y-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data gambar yang akan diproses:</p>
                <code className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg font-mono text-green-600 dark:text-green-400 text-sm truncate border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">{imageId}</code>
              </div>

              {!taskId ? (
                <Button
                  onClick={handleStartDetection}
                  disabled={runFeature.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 text-lg rounded-xl shadow-md transition-all active:scale-95"
                >
                  {runFeature.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
                  Mulai Hitung Pohon
                </Button>
              ) : isTimedOut ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-900/30 space-y-4 transition-colors">
                  <div className="flex justify-between items-center text-sm font-bold text-amber-700 dark:text-amber-400">
                    <span>Waktu tunggu hampir habis...</span>
                    <span>90%+</span>
                  </div>
                  <Progress value={90} className="h-3 bg-amber-200 dark:bg-amber-900/40" />
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    Proses di server mungkin membutuhkan waktu lebih lama. Anda dapat mencoba mengambil hasil secara paksa.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                      onClick={() => statusQuery.refetch()}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" /> Cek Hasil (Retry)
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500"
                      onClick={() => {
                        localStorage.removeItem("pending_detection_task");
                        localStorage.removeItem("pending_detection_image");
                        setTaskId(null);
                        setIsProcessing(false);
                        setIsTimedOut(false);
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-xl border border-gray-200 dark:border-gray-700 space-y-6 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-1">Status Sistem</span>
                      <span className="text-green-600 dark:text-green-400 font-bold animate-pulse">Sedang menghitung jumlah pohon...</span>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-black text-green-600 dark:text-green-400">{simulatedProgress}%</span>
                    </div>
                  </div>
                  <Progress value={simulatedProgress} className="h-3 bg-gray-200 dark:bg-gray-700 shadow-inner" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">Sistem sedang menganalisis foto drone untuk menghitung setiap pohon durian.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: RESULTS */}
        {step === 3 && (
          !results ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm animate-pulse space-y-4 transition-colors">
              <Loader2 className="h-10 w-10 text-green-600 dark:text-green-500 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Menganalisis Hasil Perhitungan...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-12 animate-fade-in">
              {/* Stats Panel */}
              <div className="md:col-span-4 space-y-6">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors">
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Hasil Perhitungan</h2>
                  </div>

                  {resultsQuery.isLoading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="h-8 w-8 text-green-600 dark:text-green-500 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-8 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-center space-y-1 transition-colors">
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total Pohon</p>
                        <p className="text-7xl font-black text-green-600 dark:text-green-400 drop-shadow-sm">{treeCount}</p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={handleGenerateReport}
                          disabled={isGeneratingReport || !treeCount}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          {isGeneratingReport ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <span className="text-xl">📄</span>
                          )}
                          {isGeneratingReport ? "Membuat laporan..." : "Unduh Laporan Hasil"}
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full h-12 border-green-600 dark:border-green-500 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl font-semibold"
                          onClick={() => { setStep(1); setImageId(null); setTaskId(null); setSearchParams({}); }}
                        >
                          Hitung dari Foto Lainnya
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Annotated Image Renderer */}
              <div className="md:col-span-8">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm flex flex-col h-full min-h-[600px] transition-colors">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center transition-colors">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-green-600 dark:text-green-500" />
                      <h2 className="font-semibold text-gray-800 dark:text-gray-100">Visualisasi Hasil Deteksi</h2>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={handleZoomIn} title="Perbesar">
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={handleZoomOut} title="Perkecil">
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={handleReset} title="Reset">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 relative bg-gray-50 dark:bg-gray-900/50 group overflow-hidden transition-colors">
                    <div
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onWheel={handleWheel}
                      className={cn(
                        "w-full h-full flex justify-center items-center p-6 min-h-[500px] overflow-hidden",
                        isDragging ? "cursor-grabbing" : "cursor-grab"
                      )}
                    >
                      {annotatedUrl ? (
                        <div className="relative shadow-2xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
                          <img
                            src={annotatedUrl}
                            alt="Hasil Anotasi Pohon"
                            className="max-w-full max-h-[70vh] object-contain transition-transform duration-100 select-none"
                            style={{
                              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                              transformOrigin: "center center"
                            }}
                            onError={(e) => {
                              console.error("Annotated image failed to load:", annotatedUrl);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = `<div class="text-gray-400 dark:text-gray-500 flex flex-col items-center p-12"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><p class="font-medium">Gagal memuat visual anotasi.</p></div>`;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="text-gray-400 dark:text-gray-500 flex flex-col items-center gap-2 p-12">
                          <AlertCircle className="h-12 w-12 opacity-20" />
                          <p className="font-medium">Visual anotasi tidak ditemukan.</p>
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm text-gray-500 dark:text-gray-400 text-[11px] px-3 py-1.5 rounded-lg pointer-events-none font-medium transition-colors">
                      Zoom: <span className="text-green-600 dark:text-green-400 font-bold">{scale.toFixed(1)}x</span> | Drag untuk menggeser
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default DetectionPage;
