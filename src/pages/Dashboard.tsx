import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DetectionChart } from "@/components/dashboard/DetectionChart";
import { LatestImages } from "@/components/dashboard/LatestImages";
import {
  TreeDeciduous,
  Image as ImageIcon,
  UploadCloud,
  Loader2,
  Map,
  PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  getDashboardSummary,
  getDashboardTrends,
  getLatestImages,
} from "@/services/dashboard.service";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const formatNumber = (n: any) => (n ?? 0).toLocaleString("id-ID");

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [latestImages, setLatestImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const loadData = async (showSilently = false) => {
    try {
      if (!showSilently) setLoading(true);
      const [summaryRes, trendsRes, latestRes] = await Promise.all([
        getDashboardSummary(),
        getDashboardTrends({ days: 7 }),
        getLatestImages({ limit: 5 }),
      ]);

      if (summaryRes) setSummary(summaryRes);
      if (trendsRes) setTrends(Array.isArray(trendsRes) ? trendsRes : []);
      if (latestRes) {
        setLatestImages(Array.isArray(latestRes) ? latestRes : []);
        const processing = latestRes.some((img: any) =>
          img.status?.toLowerCase() === "processing" ||
          img.status?.toLowerCase() === "running" ||
          img.status?.toLowerCase() === "pending"
        );
        setIsProcessing(processing);
      }
    } catch (error) {
      console.error("Gagal memuat data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isProcessing && latestImages.length > 0 && !loading) {
      const lastStatus = localStorage.getItem("last_detection_status");
      if (lastStatus === "processing") {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        localStorage.removeItem("last_detection_status");
      }
    }
  }, [isProcessing, latestImages, loading]);

  const trendData = (trends || []).map(item => ({
    date: item.date,
    trees: item.total_trees || 0,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const hasData = summary?.total_images > 0;
  const latestResult = latestImages[0];

  return (
    <DashboardLayout title="Dashboard" description="Sistem Penghitung Pohon Durian">
      <div className="max-w-4xl mx-auto space-y-10 pb-12 pt-6 md:pt-8 px-4 transition-colors">

        {/* 1. Hero */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">Selamat datang di DurianCount 👋</h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Pantau kebun Anda dengan mudah. Hitung jumlah pohon durian dari citra drone secara otomatis dan akurat.
          </p>
        </div>

        {/* 2. Tombol CTA */}
        <div className="space-y-4">
          <p className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fitur Utama</p>
          <div className="flex flex-col sm:flex-row justify-center items-stretch gap-4 w-full">
            {/* Button 1: Upload & Deteksi */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <Button
                size="lg"
                disabled={isProcessing}
                onClick={() => {
                  localStorage.setItem("last_detection_status", "processing");
                  navigate("/deteksi");
                }}
                className={cn(
                  "w-full h-auto py-4 px-6 shadow-md hover:shadow-lg rounded-xl transition-all",
                  isProcessing ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500" : "bg-green-600 hover:bg-green-700 text-white hover:-translate-y-0.5"
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                  <span className="text-lg font-bold">Upload & Deteksi</span>
                </div>
              </Button>
            </div>

            {/* Button 2: Peta Digital */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <Button
                size="lg"
                onClick={() => navigate("/peta")}
                className="w-full h-auto py-4 px-6 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 shadow-md hover:shadow-lg rounded-xl transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center gap-2">
                  <Map className="h-5 w-5" />
                  <span className="text-lg font-bold">Peta Digital</span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 font-medium text-sm animate-pulse bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-200 dark:border-green-900/30 w-fit mx-auto">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sistem sedang memproses data... 🌱
          </div>
        )}

        {/* Loading / Empty State / Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Memuat data kebun...</p>
          </div>
        ) : !hasData ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl transition-colors">
            <TreeDeciduous className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Belum ada data kebun</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Upload foto pertama Anda untuk mulai menghitung pohon 🌱</p>
          </div>
        ) : (
          <div className="space-y-10" ref={resultsRef}>

            {/* 3. KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <Card className="p-6 flex items-center gap-5 rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="h-14 w-14 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center shrink-0">
                  <TreeDeciduous className="h-7 w-7" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Total Pohon Terdeteksi</p>
                  <p className="text-3xl font-black text-gray-800 dark:text-gray-100 leading-none">
                    {formatNumber(summary?.total_durian_trees_detected)}
                  </p>
                </div>
              </Card>

              <Card className="p-6 flex items-center gap-5 rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="h-14 w-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                  <ImageIcon className="h-7 w-7" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Total Citra Diproses</p>
                  <p className="text-3xl font-black text-gray-800 dark:text-gray-100 leading-none">
                    {formatNumber(summary?.total_images)}
                  </p>
                </div>
              </Card>
            </div>

            {/* 4. Konten Tengah (Riwayat & Grafik) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mt-10">
              {/* Riwayat */}
              <div className="col-span-1 flex flex-col h-full">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Riwayat Terakhir</h2>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                  <LatestImages
                    images={latestImages}
                    isLoading={loading}
                    onNavigate={(id) => navigate(`/deteksi?image_id=${id}`)}
                  />
                </div>
              </div>

              {/* Grafik */}
              <div className="col-span-1 lg:col-span-2 flex flex-col h-full">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Tren Perhitungan Pohon Durian</h2>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                  <div className="h-[360px] w-full">
                    <DetectionChart data={trendData} isLoading={loading} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-8" />

            {/* 5. Video Tutorial Section */}
            <div className="w-full">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Video Panduan</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tonton panduan singkat penggunaan sistem</p>
              </div>
              <div className="h-[220px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm p-4 flex items-center justify-center group cursor-pointer border border-gray-200 dark:border-gray-700 transition-all hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="text-center space-y-3 opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="h-12 w-12 bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform group-hover:text-green-600 dark:group-hover:text-green-400">
                    <PlayCircle className="h-8 w-8 ml-0.5" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Video tutorial akan ditampilkan di sini</p>
                </div>
              </div>
            </div>

            {/* 6. Cara Penggunaan (Compact) */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm transition-colors">
              <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6 text-center">Cara Penggunaan Cepat</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-bold flex items-center justify-center shrink-0 shadow-sm">1</div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Unggah foto drone orthophoto kebun Anda</p>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-bold flex items-center justify-center shrink-0 shadow-sm">2</div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Sistem menghitung pohon menggunakan AI</p>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-bold flex items-center justify-center shrink-0 shadow-sm">3</div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Lihat hasil deteksi dan unduh laporan PDF</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
