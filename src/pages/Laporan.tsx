import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Download, Calendar, User, Loader2, AlertCircle, FileText, TreePine } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useGenerateReport } from "@/hooks/useReport";
import { useDetectionResults } from "@/hooks/useDetection";
import { useCurrentUser } from "@/hooks/useAuth";
import { useImage } from "@/hooks/useImages";
import { imageService } from "@/services/image.service";

const Laporan = () => {
  const { data: currentUser } = useCurrentUser();
  const userName = currentUser?.name || "Pengguna";
  const userKey = currentUser?.email || currentUser?.name || "guest";

  const generateReport = useGenerateReport();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const storedImageId = searchParams.get("image_id");
  const reportUrlFromState = location.state?.reportUrl;
  const metaFromState = location.state?.reportMeta;

  // Safe JSON parsing of persisted meta
  const getPersistedMeta = () => {
    const raw = localStorage.getItem(`lastReport_${userKey}`) || localStorage.getItem("lastReport");
    if (!raw) return null;
    try {
      if (raw.startsWith("{")) {
        return JSON.parse(raw);
      }
      return { url: raw };
    } catch {
      return { url: raw };
    }
  };

  const effectiveMeta = metaFromState || getPersistedMeta();
  const effectiveReportUrl = effectiveMeta?.url;

  // Hardened fallbacks for UI stability
  const treeCountDisplay = effectiveMeta?.treeCount !== undefined && effectiveMeta?.treeCount !== null
    ? effectiveMeta.treeCount.toLocaleString()
    : "-";

  const fileNameDisplay = effectiveMeta?.fileName || "-";

  const dateStr = effectiveMeta?.generatedAt
    ? new Date(effectiveMeta.generatedAt).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
    : "-";

  const [validatedUrl, setValidatedUrl] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const checkUrl = async () => {
      const storageKey = userKey ? `lastReport_${userKey}` : "lastReport";
      const cacheKey = userKey ? `reportCache_${userKey}` : "reportCache";

      const persisted = localStorage.getItem(storageKey);
      let urlToCheck = reportUrlFromState;

      if (!urlToCheck && persisted) {
        try {
          if (persisted.startsWith("{")) {
            urlToCheck = JSON.parse(persisted).url;
          } else {
            urlToCheck = persisted;
          }
        } catch {
          urlToCheck = persisted;
        }
      }

      if (!urlToCheck) return;

      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { url, timestamp } = JSON.parse(cached);
          const isSameUrl = url === urlToCheck;
          const isRecent = Date.now() - timestamp < 5 * 60 * 1000;

          if (isSameUrl && isRecent) {
            setValidatedUrl(urlToCheck);
            setIsFromCache(true);
            return;
          }
        } catch (e) {
          localStorage.removeItem(cacheKey);
        }
      }

      try {
        setIsValidating(true);
        setIsFromCache(false);
        setValidationError(null);

        let response = await fetch(urlToCheck, { method: 'HEAD' });

        if (!response.ok) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          try {
            response = await fetch(urlToCheck, {
              method: 'GET',
              signal: controller.signal,
              headers: { 'Range': 'bytes=0-0' }
            });
            clearTimeout(timeoutId);
            controller.abort();
          } catch (e) { }
        }

        if (response.ok) {
          setValidatedUrl(urlToCheck);
          localStorage.setItem(cacheKey, JSON.stringify({
            url: urlToCheck,
            timestamp: Date.now()
          }));
        } else {
          localStorage.removeItem(storageKey);
          localStorage.removeItem("lastReport");
          localStorage.removeItem(cacheKey);
          setValidatedUrl(null);
          setValidationError("Laporan sudah tidak tersedia atau telah kedaluwarsa.");
        }
      } catch (err) {
        setValidatedUrl(null);
        setValidationError("Gagal memverifikasi ketersediaan laporan.");
      } finally {
        setIsValidating(false);
      }
    };

    checkUrl();
  }, [reportUrlFromState]);

  const detectionQuery = useDetectionResults(storedImageId, !!storedImageId);
  const imageQuery = useImage(storedImageId);

  useEffect(() => {
    if (!storedImageId) {
      toast({ title: "Peringatan", description: "Citra tidak ditemukan. Silakan proses peta atau deteksi terlebih dahulu.", variant: "destructive" });
      navigate("/peta");
    }
  }, [storedImageId, navigate]);

  const handleDownloadPDF = async () => {
    if (!storedImageId) return;
    try {
      toast({
        title: "Download dimulai",
        description: "Mengunduh laporan dalam format PDF...",
      });
      const data = await generateReport.mutateAsync(storedImageId);
      if (data?.report_url) {
        window.open(data.report_url, "_blank");
      }
    } catch (err) {
      toast({ title: "Error", description: "Gagal mengunduh laporan", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout
      title="Laporan"
      description="Laporan Hasil Perhitungan pohon durian"
    >
      <div className="animate-fade-in space-y-6 max-w-6xl mx-auto px-6 py-6 transition-colors">
        {isValidating ? (
          <div className="min-h-[500px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="text-center space-y-3">
              <Loader2 className="h-10 w-10 animate-spin text-green-600 dark:text-green-500 mx-auto" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Memverifikasi dokumen...</p>
            </div>
          </div>
        ) : validatedUrl ? (
          <div className="flex flex-col gap-6 relative">
            {isFromCache && (
              <div className="absolute top-0 right-0 py-1 px-3 text-[10px] text-gray-400 dark:text-gray-500 italic bg-gray-50 dark:bg-gray-900/50 rounded-bl-lg rounded-tr-xl border-l border-b border-gray-100 dark:border-gray-700 z-10">
                ⚡ Ditampilkan dari cache
              </div>
            )}

            {/* Metadata Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl text-green-600 dark:text-green-400">
                  <TreePine className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Total Pohon</p>
                  <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{treeCountDisplay}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600 dark:text-blue-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Nama File</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{fileNameDisplay}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl text-orange-600 dark:text-orange-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Tanggal Generate</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{dateStr}</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="bg-green-100 dark:bg-green-900/30 p-2.5 rounded-xl text-green-600 dark:text-green-400">
                  <Download className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 dark:text-gray-100">Laporan Deteksi</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px] sm:max-w-md">
                    {validatedUrl}
                  </p>
                </div>
              </div>
              <a
                href={validatedUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 h-12 px-8 shadow-sm transition-all active:scale-95"
              >
                <Download className="mr-2 h-4 w-4" />
                Unduh PDF
              </a>
            </div>

            {/* PDF Viewer */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 shadow-inner overflow-hidden relative group min-h-[700px] transition-colors">
              <iframe
                src={validatedUrl}
                width="100%"
                height="800px"
                className="border-none bg-white dark:bg-gray-900 w-full"
                title="Laporan PDF"
              />
              <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center transition-colors">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Jika PDF tidak tampil, silakan{" "}
                  <a
                    href={validatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-500 font-bold hover:underline"
                  >
                    klik di sini untuk membuka di tab baru
                  </a>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-[500px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="text-center space-y-4 p-8">
              <div className="bg-gray-100 dark:bg-gray-900/50 p-8 rounded-full w-24 h-24 mx-auto flex items-center justify-center transition-colors">
                <AlertCircle className={cn("h-12 w-12", validationError ? "text-red-500" : "text-gray-400 dark:text-gray-500")} />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-black text-gray-800 dark:text-gray-100">
                  {validationError || "Belum ada laporan"}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto font-medium">
                  {validationError
                    ? "Tautan laporan mungkin sudah kedaluwarsa atau file telah dihapus dari server."
                    : "Silakan jalankan deteksi pohon dan buat laporan untuk melihat hasilnya di sini."}
                </p>
              </div>
              <Button
                onClick={() => navigate("/deteksi")}
                variant="outline"
                className="rounded-xl border-green-600 dark:border-green-500 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 px-8"
              >
                Kembali ke Deteksi
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Laporan;
