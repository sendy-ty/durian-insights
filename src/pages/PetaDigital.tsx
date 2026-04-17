import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, Play, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { Download, ChevronRight, RefreshCcw, Search, ZoomIn, ZoomOut, RotateCcw, MapPin } from "lucide-react";
import { useUploadZip, useProcessODM, useODMStatus, useODMResult } from "@/hooks/useODM";
import { getApiErrorMessage, apiClient } from "@/api/client";
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

  const fullTifUrl = tifUrl?.startsWith("http")
    ? tifUrl
    : tifUrl ? `${apiClient.defaults.baseURL}${tifUrl}` : null;

  // Reset image loading when process starts
  useEffect(() => {
    if (isProcessing) {
      setImageLoading(true);
    }
  }, [isProcessing]);

  // Normalize Preview URL
  const previewUrl = resultData?.preview_url;
  const fullPreviewUrl = previewUrl?.startsWith("http")
    ? previewUrl
    : previewUrl ? `${apiClient.defaults.baseURL}${previewUrl}` : null;

  useEffect(() => {
    console.log("PREVIEW:", fullPreviewUrl);
  }, [fullPreviewUrl]);

  const handleDownload = () => {
    if (!activeId) {
      toast({ title: "Gagal", description: "Project ID tidak ditemukan.", variant: "destructive" });
      return;
    }

    const downloadUrl = `${apiClient.defaults.baseURL}/media/odm/${activeId}/odm_orthophoto/odm_orthophoto.tif`;
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
  };

  return (
    <DashboardLayout title="Pipeline ODM" description="Pembuatan Peta Orthophoto Dengan OpenDroneMap (ODM)">
      <div className="w-full max-w-[1200px] mx-auto px-6 space-y-6 mt-6">

        {/* Card 0: Check Project */}
        <div className="rounded-xl border bg-card p-6 shadow-sm border-primary/20 bg-primary/5">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Cek Project ID
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan Project ID (UUID)..."
              className="flex-1 px-3 py-2 bg-background border rounded-md text-sm font-mono focus:ring-2 focus:ring-primary outline-none"
              value={checkProjectId}
              onChange={(e) => setCheckProjectId(e.target.value)}
            />
            <Button onClick={handleCheck} disabled={!checkProjectId || statusQuery.isLoading}>
              {statusQuery.isLoading && checkedId === checkProjectId ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cek"}
            </Button>
          </div>
          {isNotFound && checkedId && (
            <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
              <AlertCircle size={12} />
              Gagal menemukan proyek atau ID tidak valid.
            </p>
          )}
        </div>

        {/* Card 1: Upload */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">1. Upload ZIP</h2>
          <input ref={fileInputRef} type="file" className="hidden" accept={acceptedFormats} onChange={handleFileUpload} />

          <div className="space-y-4 mb-4">
            <div className="flex items-center gap-4">
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploadZip.isPending}>
                {uploadZip.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Pilih & Unggah File ZIP
              </Button>
            </div>
          </div>

          {uploadZip.isPending && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Mengunggah file...</span>
                <span className="font-semibold">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {uploadZip.isError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
              <p className="text-sm text-red-600 font-medium">Gagal mengunggah file ZIP.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Coba Lagi
              </Button>
            </div>
          )}
        </div>

        {/* Card 2: Process */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">2. Process ODM</h2>

          <div className="mb-4 space-y-2">
            <div className="text-sm">
              <span className="font-semibold">Project ID: </span>
              <span className="font-mono text-muted-foreground break-all">
                {projectId ?? <span className="text-red-500">belum ada (upload ZIP dahulu)</span>}
              </span>
            </div>
          </div>

          {processOdm.isError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Gagal memulai proses ODM.</p>
              <p className="text-xs text-red-500 mt-1">{getApiErrorMessage(processOdm.error)}</p>
            </div>
          )}

          <Button
            onClick={() => {
              console.log("[ODM] BUTTON CLICKED. projectId =", projectId);
              handleProcess();
            }}
            disabled={!projectId || isProcessing || processOdm.isPending}
            className="mb-4"
          >
            {processOdm.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Mulai Proses
          </Button>

          {projectId && statusQuery.data && (
            <div className="bg-muted p-4 rounded-lg space-y-3 font-mono text-sm mt-4">
              <p className={cn("font-bold", currentStatus === "failed" ? "text-red-600" : "text-primary")}>
                <strong>Status:</strong> {currentStatus || 'Menunggu...'}
              </p>
              {currentStep && currentStep !== "-" && <p><strong>Step:</strong> {currentStep}</p>}
              {!isFinished && currentStatus !== "failed" && (
                  <div className="space-y-1 transition-all duration-500">
                    <div className="flex justify-between items-end mb-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Current Step</span>
                        <strong className="text-primary animate-pulse">{currentStage}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-primary">{Math.floor(fakeProgress)}%</span>
                      </div>
                    </div>
                    <Progress value={fakeProgress} className="h-3 transition-all duration-500 bg-primary/10" />
                    {!isProcessing && (
                      <p className="text-[10px] text-muted-foreground italic mt-2">
                        Menunggu proses dimulai...
                      </p>
                    )}
                  </div>
              )}
              {currentStatus === "failed" && (
                <div className="pt-2">
                  <Button variant="destructive" onClick={handleProcess} size="sm">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Ulangi Proses
                  </Button>
                </div>
              )}
            </div>
          )}

          {statusQuery.isError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Gagal memantau status.</p>
              <Button variant="outline" size="sm" onClick={() => statusQuery.refetch()} className="mt-2 bg-white">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Coba Hubungkan Kembali
              </Button>
            </div>
          )}
        </div>

        {/* Card 3: Results */}
        {isFinished && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-green-800 mb-2">ODM Selesai!</h2>
            <p className="text-green-700 mb-6">Peta Digital telah berhasil diproses dan siap digunakan.</p>

            {resultQuery.isLoading ? (
              <div className="flex items-center gap-2 text-green-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mengambil data hasil...</span>
              </div>
            ) : resultQuery.isError ? (
              <div className="space-y-4">
                <p className="text-red-600">Gagal mengambil data hasil.</p>
                <Button variant="outline" onClick={() => resultQuery.refetch()} size="sm">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Image Preview Block */}
                <div className="relative rounded-lg overflow-hidden border border-green-200 bg-white">
                  {previewUrl ? (
                    <>
                      {imageLoading && (
                        <div className="aspect-video w-full bg-green-100/50 animate-pulse flex items-center justify-center">
                          <Loader2 className="h-8 w-8 text-green-300 animate-spin" />
                        </div>
                      )}
                      <div className="relative group">
                        <div 
                          className="overflow-hidden bg-muted/20"
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                        >
                          <img
                            src={fullPreviewUrl || ""}
                            alt="Orthomosaic Preview"
                            onError={(e) => {
                              console.log("IMG ERROR", e);
                              setImageLoading(false);
                            }}
                            style={{ 
                              transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`, 
                              transformOrigin: 'center center',
                              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                            }}
                            className={cn(
                              "w-full h-auto max-h-[600px] object-contain transition-transform duration-300 ease-out select-none",
                              imageLoading ? "opacity-0 h-0" : "opacity-100"
                            )}
                            onLoad={() => setImageLoading(false)}
                            onDoubleClick={() => {
                              setZoom(1);
                              setPos({ x: 0, y: 0 });
                            }}
                          />
                        </div>
                        
                        {!imageLoading && (
                          <>
                            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg z-10 shadow-lg border border-white/10">
                              <div className="text-base font-semibold">
                                Project ID: {activeId}
                              </div>
                            </div>
                            
                            <div className="absolute top-2 right-2 flex flex-col gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-8 w-8 bg-black/70 hover:bg-black/90 border-none text-white shadow-xl"
                                onClick={() => setZoom(z => Math.min(z + 0.2, 3))}
                                title="Perbesar"
                              >
                                <ZoomIn className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-8 w-8 bg-black/70 hover:bg-black/90 border-none text-white shadow-xl"
                                onClick={() => setZoom(z => Math.max(z - 0.2, 1))}
                                title="Perkecil"
                              >
                                <ZoomOut className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-8 w-8 bg-black/70 hover:bg-black/90 border-none text-white shadow-xl"
                                onClick={() => {
                                  setZoom(1);
                                  setPos({ x: 0, y: 0 });
                                }}
                                title="Reset Zoom"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="aspect-video w-full bg-green-50 flex flex-col items-center justify-center text-green-600 p-8">
                      <Loader2 className="h-10 w-10 mb-3 animate-spin opacity-40" />
                      <p className="text-sm font-medium">Menunggu hasil preview...</p>
                      <p className="text-xs opacity-60 italic">ODM sedang menyiapkan file orthophoto</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  {activeId && (
                    <Button 
                      onClick={handleDownload}
                      className="bg-green-600 hover:bg-green-700 text-white shadow-lg border-none px-6"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Orthophoto (.tif)
                    </Button>
                  )}
                  {resultImageId && (
                    <Button asChild className="bg-green-600 hover:bg-green-700 text-white shadow-lg border-none px-6">
                      <Link to={`/deteksi?image_id=${resultImageId}`}>
                        Lanjut ke Deteksi
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {projectId && (
          <Button variant="outline" onClick={resetPipeline} className="w-full">Riset Pipeline</Button>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PetaDigital;
