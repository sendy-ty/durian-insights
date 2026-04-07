import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useUploadZip, useProcessODM, useODMStatus, useODMResult } from "@/hooks/useODM";
import { getApiErrorMessage } from "@/api/client";

const PetaDigital = () => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const acceptedFormats = ".zip";

  const uploadZip = useUploadZip();
  const processOdm = useProcessODM();
  const navigate = useNavigate();

  // Polling every 3 seconds when processing is active
  const statusQuery = useODMStatus(projectId, isProcessing ? 3000 : undefined);

  const isFinished = statusQuery.data?.status?.toLowerCase() === "completed" || statusQuery.data?.status?.toLowerCase() === "success";
  const resultQuery = useODMResult(projectId, isFinished);

  // Transition when status updates to completed
  useEffect(() => {
    if (statusQuery.data) {
      const status = statusQuery.data.status?.toLowerCase();
      if (status === "completed" || status === "success" || status === "failed") {
        setIsProcessing(false);
      }
    }
  }, [statusQuery.data]);

  // Navigate when result is fully captured securely
  useEffect(() => {
    if (resultQuery.data) {
      // Safely extract image_id supporting multi-layered Axio objects locally
      const imgId = resultQuery.data?.data?.image_id || resultQuery.data?.image_id || (resultQuery.data as any)?.image_id;
      
      if (imgId) {
        toast({ title: "Peta Siap", description: "Mengarahkan ke deteksi...", duration: 2000 });
        setTimeout(() => {
          navigate(`/deteksi?image_id=${imgId}`);
        }, 1500);
      }
    }
  }, [resultQuery.data, navigate]);

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
    setProjectId(null);
    setIsProcessing(false);

    try {
      const result = await uploadZip.mutateAsync({
        file,
        onProgress: (percent) => setUploadProgress(percent),
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
      console.log("[ODM] project_id saved to state:", pid);
      toast({ title: "Berhasil", description: `File ZIP berhasil diunggah. project_id: ${pid}` });
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
    setIsProcessing(true);
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
    setUploadProgress(0);
    setIsProcessing(false);
  };

  return (
    <DashboardLayout title="Pipeline ODM" description="UI Minimal untuk menguji OpenDroneMap Pipeline">
      <div className="max-w-3xl mx-auto space-y-6 mt-6">
        
        {/* Card 1: Upload */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">1. Upload ZIP</h2>
          <input ref={fileInputRef} type="file" className="hidden" accept={acceptedFormats} onChange={handleFileUpload} />
          
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploadZip.isPending}>
              {uploadZip.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Pilih & Unggah File ZIP
            </Button>
          </div>
          
          {uploadZip.isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mengunggah file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
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
              <p><strong>Status:</strong> {statusQuery.data.status || 'Menunggu...'}</p>
              <p><strong>Step:</strong> {statusQuery.data.step || '-'}</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <strong>Progress:</strong>
                  <span>{statusQuery.data.progress || 0}%</span>
                </div>
                <Progress value={statusQuery.data.progress || 0} className="h-2" />
              </div>
            </div>
          )}
        </div>

        {projectId && (
           <Button variant="outline" onClick={resetPipeline} className="w-full">Riset Pipeline</Button>
        )}

      </div>
    </DashboardLayout>
  );
};

export default PetaDigital;
