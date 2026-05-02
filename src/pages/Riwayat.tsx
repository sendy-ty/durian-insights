import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Download,
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useImages, useDeleteImage } from "@/hooks/useImages";
import { useGenerateReport } from "@/hooks/useReport";
import { imageService } from "@/services/image.service";
import { getApiErrorMessage } from "@/api/client";

const Riwayat = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch images from backend
  const imagesQuery = useImages();
  const deleteImageMutation = useDeleteImage();
  const generateReport = useGenerateReport();

  const images = imagesQuery.data || [];

  // Filter by search
  const filteredData = images.filter(
    (item) =>
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.image_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalImages = filteredData.length;

  const handleView = (imageId: string) => {
    // Navigate to deteksi with the image_id to view annotated results
    navigate(`/deteksi?image_id=${imageId}`);
  };

  const handleViewAnnotated = (imageId: string) => {
    // Open the annotated preview in a new tab
    const previewUrl = imageService.getPreviewUrl(imageId);
    window.open(previewUrl, "_blank");
  };

  const handleDownload = async (imageId: string) => {
    try {
      toast({
        title: "Download dimulai",
        description: "Mengunduh laporan...",
      });
      const data = await generateReport.mutateAsync(imageId);
      if (data?.report_url) {
        window.open(data.report_url, "_blank");
      }
    } catch (err) {
      toast({
        title: "Gagal mengunduh laporan",
        description: getApiErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteImageMutation.mutateAsync(deleteId);
      setDeleteId(null);
      toast({
        title: "Berhasil dihapus",
        description: "Citra telah dihapus dari server.",
      });
    } catch (err) {
      toast({
        title: "Gagal menghapus citra",
        description: getApiErrorMessage(err, "Gagal menghapus citra. Coba lagi."),
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    // Export as CSV
    if (images.length === 0) return;
    const header = "Image ID,Filename,Upload Date,File Size\n";
    const rows = images
      .map(
        (img) =>
          `${img.image_id},${img.filename},${img.upload_date},${img.file_size}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "riwayat_citra.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Ekspor selesai",
      description: "File CSV telah diunduh.",
    });
  };

  return (
    <DashboardLayout
      title="Riwayat"
      description="Daftar citra yang telah diunggah dan diproses"
    >
      <div className="space-y-6 animate-fade-in transition-colors">
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border dark:border-gray-700 bg-card dark:bg-gray-800 p-4 shadow-sm transition-colors">
            <p className="text-2xl font-bold text-primary dark:text-green-400">
              {imagesQuery.isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                totalImages
              )}
            </p>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Total Citra</p>
          </div>
          <div className="rounded-xl border border-border dark:border-gray-700 bg-card dark:bg-gray-800 p-4 shadow-sm transition-colors">
            <p className="text-2xl font-bold text-card-foreground dark:text-gray-100">
              {imagesQuery.isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                images.length
              )}
            </p>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Citra Tersedia</p>
          </div>
          <div className="rounded-xl border border-border dark:border-gray-700 bg-card dark:bg-gray-800 p-4 shadow-sm transition-colors">
            <p className="text-2xl font-bold text-card-foreground dark:text-gray-100">
              {imagesQuery.isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : images.length > 0 ? (
                `${(images.reduce((sum, i) => sum + i.file_size, 0) / 1024 / 1024).toFixed(1)} MB`
              ) : (
                "–"
              )}
            </p>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Total Ukuran</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border dark:border-gray-700 bg-card dark:bg-gray-800 p-4 shadow-sm transition-colors">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-gray-500" />
            <Input
              placeholder="Cari berdasarkan nama file atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => imagesQuery.refetch()}
              disabled={imagesQuery.isRefetching}
              className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {imagesQuery.isRefetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={images.length === 0} className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
              <Download className="mr-2 h-4 w-4" />
              Ekspor
            </Button>
          </div>
        </div>

        {/* Error state */}
        {imagesQuery.isError && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive dark:text-red-400 transition-colors">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Gagal memuat data citra</p>
              <p className="text-xs text-destructive/80 dark:text-red-400/80">Periksa koneksi ke server.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto border-destructive/30 text-destructive dark:text-red-400 hover:bg-destructive/10 dark:hover:bg-red-900/20"
              onClick={() => imagesQuery.refetch()}
            >
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-border dark:border-gray-700 bg-card dark:bg-gray-800 shadow-sm overflow-hidden transition-colors">
          {imagesQuery.isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground dark:text-gray-500" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground dark:text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50 dark:text-gray-700" />
              <p className="font-medium">
                {images.length === 0
                  ? "Belum ada citra. Upload citra drone untuk memulai!"
                  : "Tidak ada hasil yang cocok dengan pencarian."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 dark:bg-gray-900/50 border-border dark:border-gray-700">
                  <TableHead className="text-gray-600 dark:text-gray-400">ID</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-400">Tanggal</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-400">File</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-400">Ukuran</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-400">Status</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-400">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.image_id} className="hover:bg-muted/30 dark:hover:bg-gray-700/30 border-border dark:border-gray-700 transition-colors">
                    <TableCell className="font-medium font-mono text-xs text-gray-900 dark:text-gray-100">
                      {item.image_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-muted-foreground dark:text-gray-400">
                      {new Date(item.upload_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-gray-800 dark:text-gray-200">
                      {item.filename}
                    </TableCell>
                    <TableCell className="text-muted-foreground dark:text-gray-400">
                      {(item.file_size / 1024 / 1024).toFixed(1)} MB
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className="bg-primary/10 dark:bg-green-900/30 text-primary dark:text-green-400 hover:bg-primary/20 dark:hover:bg-green-900/40"
                      >
                        Tersedia
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-green-400"
                          onClick={() => handleView(item.image_id)}
                          title="Lihat deteksi"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-green-400"
                          onClick={() => handleDownload(item.image_id)}
                          disabled={generateReport.isPending}
                          title="Download laporan"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => setDeleteId(item.image_id)}
                          title="Hapus citra"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Hapus Citra?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              Apakah Anda yakin ingin menghapus citra ini? Tindakan ini
              tidak dapat dibatalkan dan semua data deteksi terkait akan hilang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteImageMutation.isPending} className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-red-600 dark:hover:bg-red-700"
              disabled={deleteImageMutation.isPending}
            >
              {deleteImageMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {deleteImageMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Riwayat;
