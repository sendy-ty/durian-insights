import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, Play, AlertCircle, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { Download, ChevronRight, RefreshCcw, Search, ZoomIn, ZoomOut, RotateCcw, MapPin } from "lucide-react";
import { useUploadZip, useProcessODM, useODMStatus, useODMResult } from "@/hooks/useODM";
import { getApiErrorMessage, apiClient, normalizeUrl } from "@/api/client";
import { cn } from "@/lib/utils";

const ODM_STAGES = [
  { name: "Dataset Preparation", progress: 5 },
  { name: "OpenSFM Reconstruction", progress: 20 },
  { name: "OpenMVS Densification", progress: 40 },
  { name: "Point Cloud Filtering", progress: 55 },
  { name: "Georeferencing", progress: 70 },
  { name: "Generating DEM", progress: 85 },
  { name: "Orthophoto Rendering", progress: 100 }
];

const PetaDigital = () => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0); // Real backend progress
  const [fakeProgress, setFakeProgress] = useState(0); // UI smooth progress
  const [currentStage, setCurrentStage] = useState(ODM_STAGES[0].name);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [zoom, setZoom] = useState(1);

  // New state for checking project
  const [checkProjectId, setCheckProjectId] = useState("");
  const [checkedId, setCheckedId] = useState<string | null>(null);

  // Preview Interaction State
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const lastProgressRef = useRef(0);
  const lastUpdateRef = useRef(Date.now());



  const fileInputRef = useRef<HTMLInputElement>(null);
  const acceptedFormats = ".zip";

  const uploadZip = useUploadZip();
  const processOdm = useProcessODM();
  const navigate = useNavigate();

  // Polling logic correctly typed and scoped
  // Polling every 3 seconds when processing is active AND not finished/failed
  // calculate isFinished inside enable/interval logic if needed, or define variables in order

  // 1. Initialise the query
  const activeId = checkedId || projectId;

  // Persist projectId if activeId exists (sync manual lookup back to active pipeline)
  useEffect(() => {
    if (activeId && !projectId) {
      setProjectId(activeId);
    }
  }, [activeId, projectId]);

  useEffect(() => {
    console.log("PROJECT ID:", projectId);
    console.log("ACTIVE ID:", activeId);
  }, [projectId, activeId]);

  const statusQuery = useODMStatus(
    activeId,
    (isProcessing && !!activeId) ? 3000 : undefined
  );

  useEffect(() => {
    if (activeId) {
      console.log("STATUS RESPONSE:", statusQuery.data);
    }
  }, [activeId, statusQuery.data]);

  // 2. Extract results
  const statusData = statusQuery.data?.data;
  const currentStatus = (statusData?.status || "").toLowerCase();
  const currentStep = statusData?.step ?? "-";
  const currentProgress = statusData?.progress ?? 0;

  // 3. Define finality
  const isFinished = currentStatus === "completed" || currentProgress >= 100;

  const isNotFound = statusQuery.isError || (statusQuery.data && (statusQuery.data as any).status === "error");

  // 4. Update the query behavior if finished or failed to be extra sure
  // Note: we might want to just set isProcessing to false in the useEffect which is cleaner
  // Query will stop polling once isProcessing is false.

  const resultQuery = useODMResult(activeId, {
    enabled: !!activeId,
    refetchInterval: (data: any) => {
      const res = data?.data || data;
      return res?.preview_url ? false : 2000;
    }
  });

  useEffect(() => {
    console.log("RESULT POLLING:", resultQuery.data);
  }, [resultQuery.data]);

  // Transition when status updates to completed or fails
  useEffect(() => {
    if (statusQuery.isError) {
      setIsProcessing(false);
      toast({
        title: "Koneksi Terputus",
        description: "Gagal memantau status ODM. Coba muat ulang halaman.",
        variant: "destructive"
      });
      return;
    }

    if (statusQuery.data) {
      console.log("ODM STATUS FULL:", statusQuery.data);
      if (isFinished || currentStatus === "failed") {
        setIsProcessing(false);
      }
    }
  }, [statusQuery.data, statusQuery.isError, isFinished, currentStatus]);

  useEffect(() => {
    if (!isProcessing) {
      setProgress(0);
      return;
    }

    const apiProgress = statusData?.progress || 0;
    // Clamp between 0 and 100 for safety
    const clampedProgress = Math.min(Math.max(apiProgress, 0), 100);
    setProgress(clampedProgress);
  }, [statusData, isProcessing]);

  // Visual/Fake Progress Logic for smoother UX
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isProcessing && !isFinished) {
      timer = setInterval(() => {
        setFakeProgress((prev) => {
          // Gradual increment
          let increment = 0.2 + (Math.random() * 0.3);

          // If backend is significantly ahead, speed up catchup
          if (progress > prev + 5) {
            increment = 1.5;
          } else if (progress > prev) {
            increment = 0.8;
          }

          const next = prev + increment;
          if (next >= 99) return 99; // Hold at 99 until backend says finished
          return next;
        });
      }, 800);
    } else if (isFinished) {
      setFakeProgress(100);
    } else {
      setFakeProgress(0);
    }

    return () => clearInterval(timer);
  }, [isProcessing, isFinished, progress]);

  // Update Stage Label based on fakeProgress
  useEffect(() => {
    if (!isProcessing && !isFinished) {
      setCurrentStage(ODM_STAGES[0].name);
      return;
    }

    // Find first stage where progress is >= current fakeProgress
    const stage = ODM_STAGES.find(s => fakeProgress <= s.progress) || ODM_STAGES[ODM_STAGES.length - 1];
    setCurrentStage(stage.name);
  }, [fakeProgress, isProcessing, isFinished]);

  // Refetch results when processing finishes (Polling handles this now, keeping for safety)
  useEffect(() => {
    if (isFinished && activeId) {
      console.log("ODM COMPLETED. SYNCING RESULTS...");
      resultQuery.refetch();
    }
  }, [isFinished, activeId]);

  // 10. Debug results
  useEffect(() => {
    if (resultQuery.data) {
      const res = (resultQuery.data as any)?.data || resultQuery.data;
      const preview = res?.preview_url;
      console.log("RESULT:", resultQuery.data);
      console.log("PREVIEW URL:", preview);
    }
  }, [resultQuery.data]);

  // We remove the auto-navigation useEffect
  const resultData = (resultQuery.data as any)?.data || resultQuery.data;
  const tifUrl = resultData?.orthomosaic_url;
  const resultImageId = resultData?.image_id;
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const fullTifUrlRaw = tifUrl?.startsWith("http")
    ? tifUrl
    : tifUrl ? `${apiClient.defaults.baseURL}${tifUrl}` : null;
  const fullTifUrl = normalizeUrl(fullTifUrlRaw);

  // Reset image loading when process starts
  useEffect(() => {
    if (isProcessing) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [isProcessing]);

  // Use preview URL from result endpoint ONLY
  const previewUrl = resultData?.preview_url;
  const fullPreviewUrlRaw = previewUrl?.startsWith("http")
    ? previewUrl
    : previewUrl ? `${apiClient.defaults.baseURL}${previewUrl}` : null;
  const fullPreviewUrl = normalizeUrl(fullPreviewUrlRaw);

  useEffect(() => {
    console.log("PREVIEW:", fullPreviewUrl);
  }, [fullPreviewUrl]);

  const handleDownload = () => {
    if (!activeId) {
      toast({ title: "Gagal", description: "Project ID tidak ditemukan.", variant: "destructive" });
      return;
    }

    const downloadUrlRaw = `${apiClient.defaults.baseURL}/media/odm/${activeId}/odm_orthophoto/odm_orthophoto.tif`;
    const downloadUrl = normalizeUrl(downloadUrlRaw);
    console.log("FINAL DOWNLOAD URL:", downloadUrl);

    try {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `orthophoto_${activeId}.tif`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
      toast({ title: "Error", description: "Gagal memproses unduhan.", variant: "destructive" });
    }
  };

  const handleSelectProject = (projectId: string) => {
    setCheckedId(projectId);
    setCheckProjectId(projectId); // Update input field too
    setImageLoading(true); // Reset image loading for new selection
    setPos({ x: 0, y: 0 }); // Reset position
    setZoom(1); // Reset zoom
    toast({ title: "Proyek Dipilih", description: `Memuat status untuk ${projectId}` });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(prev + 0.2, 5));
    } else {
      setZoom(prev => Math.max(prev - 0.2, 1));
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 1));
  const handleReset = () => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };

  const handleCheck = () => {
    if (!checkProjectId) return;
    handleSelectProject(checkProjectId);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast({
        title: "Format tidak didukung",
        description: "Hanya file ZIP yang diterima.",
        variant: "destructive",
      });
      return;
    }

    setUploadProgress(0);
    setIsProcessing(false);
    setProgress(0);
    setDisplayProgress(0);
    lastProgressRef.current = 0;
    lastUpdateRef.current = Date.now();

    try {
      const result = await uploadZip.mutateAsync({
        file,
        onProgress: (percent) => {
          console.log("[UPLOAD PROGRESS]", percent);
          setUploadProgress(percent);
        },
      });

      setUploadProgress(100);
      console.log("[ODM] Upload raw result:", result);
      console.log("[ODM] result.data:", result?.data);
      console.log("[ODM] result.data.data:", (result as any)?.data?.data);

      const pid =
        result?.data?.data?.project_id ||
        result?.data?.project_id ||
        (result as any)?.project_id;

      console.log("[ODM] Extracted project_id:", pid);

      if (!pid) {
        toast({ title: "Error", description: "project_id tidak ditemukan dari API.", variant: "destructive" });
        return;
      }

      setProjectId(pid);
      setIsProcessing(false); // ENSURE NO AUTO PROCESSING
      console.log("[ODM] project_id saved to state:", pid);
      toast({ title: "Upload Berhasil", description: "Klik 'Mulai Proses' untuk memulai pembuatan peta." });
    } catch (err) {
      toast({ title: "Gagal mengunggah", description: getApiErrorMessage(err), variant: "destructive" });
    }
  };

  const handleProcess = async () => {
    console.log("[ODM] handleProcess called. projectId =", projectId);
    if (!projectId) {
      console.error("[ODM] handleProcess: projectId is null — aborting");
      toast({ title: "Error", description: "Tidak ada project_id. Upload ZIP dahulu.", variant: "destructive" });
      return;
    }
    setProgress(0); // Reset progress at start
    setFakeProgress(0);
    setIsProcessing(true);
    setDisplayProgress(0);
    lastProgressRef.current = 0;
    lastUpdateRef.current = Date.now();
    setImageLoading(true); // Reset image loading for new process
    setPos({ x: 0, y: 0 }); // Reset position
    setZoom(1); // Reset zoom
    try {
      console.log(`[ODM] Calling processOdm.mutateAsync with projectId = ${projectId}`);
      const processResult = await processOdm.mutateAsync(projectId);
      console.log("[ODM] Process response:", processResult);
    } catch (err) {
      console.error("[ODM] processOdm error:", err);
      toast({ title: "Gagal memulai proses", description: getApiErrorMessage(err), variant: "destructive" });
      setIsProcessing(false);
    }
  };

  const resetPipeline = () => {
    setProjectId(null);
    setCheckedId(null);
    setCheckProjectId("");
    setUploadProgress(0);
    setProgress(0);
    setFakeProgress(0);
    setIsProcessing(false);
    setDisplayProgress(0);
    setPos({ x: 0, y: 0 });
    setZoom(1);
    toast({ title: "Pipeline Direset", description: "Semua data telah dibersihkan." });
  }; return (
    <DashboardLayout title="Pemetaan Lahan" description="Buat peta kebun dari foto drone secara otomatis">
      <div className="w-full max-w-6xl mx-auto px-6 space-y-6 mt-6 animate-fade-in transition-colors">

        {/* Card 0: Check Project */}
        <div className="rounded-xl border bg-white dark:bg-gray-800 p-6 shadow-sm border-gray-200 dark:border-gray-700 transition-colors">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600 dark:text-green-500">
            <Search className="h-5 w-5" />
            Cek Proses
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan ID Proses Anda..."
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              value={checkProjectId}
              onChange={(e) => setCheckProjectId(e.target.value)}
            />
            <Button
              onClick={handleCheck}
              disabled={!checkProjectId || statusQuery.isLoading}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6"
            >
              {statusQuery.isLoading && checkedId === checkProjectId ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cek Status"}
            </Button>
          </div>
          {isNotFound && checkedId && (
            <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
              <AlertCircle size={12} />
              ID tidak ditemukan. Pastikan ID yang dimasukkan sudah benar.
            </p>
          )}
        </div>

        {/* Card 1: Upload */}
        <div className="rounded-xl border bg-white dark:bg-gray-800 p-6 shadow-sm border-gray-200 dark:border-gray-700 transition-colors">
          <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-100">1. Upload Foto Drone</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Unggah file ZIP yang berisi kumpulan foto drone kebun Anda.</p>

          <input ref={fileInputRef} type="file" className="hidden" accept={acceptedFormats} onChange={handleFileUpload} />

          <div className="space-y-4 mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadZip.isPending}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm"
              >
                {uploadZip.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Pilih & Unggah File ZIP
              </Button>
            </div>
          </div>

          {uploadZip.isPending && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Mengunggah file...</span>
                <span className="font-bold text-green-600 dark:text-green-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2 bg-gray-100 dark:bg-gray-700" />
            </div>
          )}

          {uploadZip.isError && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg space-y-3 transition-colors">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Gagal mengunggah file ZIP.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white dark:bg-gray-800 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Coba Lagi
              </Button>
            </div>
          )}
        </div>

        {/* Card 2: Process */}
        <div className="rounded-xl border bg-white dark:bg-gray-800 p-6 shadow-sm border-gray-200 dark:border-gray-700 transition-colors">
          <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-100">2. Proses Pembuatan Peta</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Mulai proses pengolahan foto drone menjadi satu peta utuh.</p>

          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-lg inline-block transition-colors">
            <div className="text-sm flex items-center gap-2">
              <span className="font-semibold text-gray-600 dark:text-gray-400">ID Proses: </span>
              <span className="font-mono text-gray-500 dark:text-gray-300 break-all">
                {projectId ?? <span className="text-red-400 italic">belum ada (upload dahulu)</span>}
              </span>
            </div>
          </div>

          {processOdm.isError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg transition-colors">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Gagal memulai proses.</p>
              <p className="text-xs text-red-500 dark:text-red-400/80 mt-1">{getApiErrorMessage(processOdm.error)}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button
              onClick={() => {
                console.log("[ODM] BUTTON CLICKED. projectId =", projectId);
                handleProcess();
              }}
              disabled={!projectId || isProcessing || processOdm.isPending}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-6 rounded-xl shadow-md transition-all active:scale-95"
            >
              {processOdm.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
              <span className="text-lg">Mulai Pembuatan Peta</span>
            </Button>

            {projectId && statusQuery.data && (
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-5 rounded-xl space-y-4 mt-2 transition-colors">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-3 w-3 rounded-full animate-pulse",
                      currentStatus === "completed" ? "bg-green-500" : currentStatus === "failed" ? "bg-red-500" : "bg-amber-500"
                    )} />
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">Status Proses</span>
                  </div>
                  <span className={cn(
                    "text-sm font-black px-3 py-1 rounded-full",
                    currentStatus === "completed" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : currentStatus === "failed" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  )}>
                    {currentStatus === "completed" ? "Selesai" : currentStatus === "failed" ? "Gagal" : "Sedang Dibuat"}
                  </span>
                </div>

                {!isFinished && currentStatus !== "failed" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-1">Tahap Sekarang</span>
                        <strong className="text-gray-700 dark:text-gray-300">{currentStage}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-green-600 dark:text-green-400">{Math.floor(fakeProgress)}%</span>
                      </div>
                    </div>
                    <Progress value={fakeProgress} className="h-3 bg-gray-200 dark:bg-gray-700 shadow-inner" />
                    {!isProcessing && (
                      <p className="text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-100 dark:border-amber-900/30 flex items-center gap-2">
                        <AlertCircle size={14} />
                        Menunggu instruksi untuk memulai...
                      </p>
                    )}
                  </div>
                )}

                {currentStatus === "failed" && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={handleProcess}
                      size="sm"
                      className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40"
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Ulangi Pembuatan Peta
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Results */}
        {isFinished && (
          <div className="rounded-xl border border-green-200 dark:border-green-800 bg-white dark:bg-gray-800 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
            <div className="flex flex-col mb-6">
              <h2 className="text-xl font-bold text-green-600 dark:text-green-500 flex items-center gap-2 mb-1">
                <MapPin className="h-5 w-5" />
                Peta Lahan Anda Sudah Siap 🌱
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Peta lahan Anda berhasil dibuat dan kini siap untuk dianalisis lebih lanjut.</p>
            </div>

            {resultQuery.isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <Loader2 className="h-10 w-10 text-green-600 dark:text-green-500 animate-spin mb-4" />
                <span className="text-gray-600 dark:text-gray-400 font-medium">Memuat pratinjau peta...</span>
              </div>
            ) : resultQuery.isError ? (
              <div className="p-8 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-center space-y-4 transition-colors">
                <p className="text-red-600 dark:text-red-400 font-medium">Gagal memuat pratinjau peta.</p>
                <Button variant="outline" onClick={() => resultQuery.refetch()} size="sm" className="bg-white dark:bg-gray-800 dark:border-gray-700">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Coba Muat Ulang
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Image Preview Block */}
                <div
                  className={cn(
                    "relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 h-[450px] shadow-inner transition-colors",
                    zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
                  )}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                >
                  {previewUrl && !imageError ? (
                    <>
                      <img
                        src={fullPreviewUrl || previewUrl}
                        alt="Pratinjau Peta"
                        className="w-full h-full object-contain transition-transform duration-300 ease-out select-none"
                        style={{
                          transform: `scale(${zoom}) translate(${pos.x / zoom}px, ${pos.y / zoom}px)`,
                        }}
                        onError={() => setImageError(true)}
                        onDoubleClick={handleReset}
                      />

                      {/* Interaction Controls */}
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 rounded-xl p-1.5 z-10 transition-colors">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={handleZoomIn}
                          title="Perbesar"
                        >
                          <ZoomIn className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={handleZoomOut}
                          title="Perkecil"
                        >
                          <ZoomOut className="h-5 w-5" />
                        </Button>
                        <div className="w-[1px] h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-3 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={handleReset}
                        >
                          <RotateCcw className="h-4 w-4 mr-1.5" />
                          Kembali
                        </Button>
                      </div>

                      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm text-gray-600 dark:text-gray-400 text-[11px] px-3 py-1.5 rounded-lg pointer-events-none font-medium transition-colors">
                        Perbesaran: <span className="text-green-600 dark:text-green-400 font-bold">{zoom.toFixed(1)}x</span> | Drag untuk menggeser
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-900/50 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 rounded-xl h-full transition-colors">
                      <AlertCircle className="h-12 w-12 mb-3 opacity-20" />
                      <p className="font-medium text-lg">Pratinjau belum tersedia</p>
                      <p className="text-sm">Silakan unduh file TIFF di bawah untuk melihat hasil peta lengkap.</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeId && (
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="h-14 border-green-600 dark:border-green-500 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 font-bold text-lg rounded-xl transition-all"
                    >
                      <Download className="mr-3 h-5 w-5" />
                      Unduh Peta (.tif)
                    </Button>
                  )}
                  {resultImageId && (
                    <Button asChild className="h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg dark:shadow-none transition-all active:scale-95">
                      <Link to={`/deteksi?image_id=${resultImageId}`}>
                        Mulai Hitung Pohon
                        <ChevronRight className="ml-2 h-6 w-6" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {projectId && (
          <div className="flex justify-center mt-6 pt-4 pb-12">
            <Button
              onClick={() => {
                if (window.confirm("Apakah Anda yakin ingin mengulang proses? Data sebelumnya akan diganti.")) {
                  resetPipeline();
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-2"
            >
              <AlertTriangle className="h-5 w-5" />
              Mulai Ulang Proses Pemetaan
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PetaDigital;
