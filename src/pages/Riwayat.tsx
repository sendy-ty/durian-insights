import { useState, useEffect } from "react";
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
import { Search, Download, Eye, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface HistoryItem {
  id: string;
  date: string;
  filename: string;
  trees: number;
  accuracy: number;
  status: "selesai" | "gagal";
}

const Riwayat = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("duriancount_history");
    if (stored) {
      setHistoryData(JSON.parse(stored));
    }
  }, []);

  // Calculate dynamic stats
  const filteredData = historyData.filter(
    (item) =>
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const successData = filteredData.filter((h) => h.status === "selesai");
  const totalTrees = successData.reduce((sum, h) => sum + h.trees, 0);
  const successCount = successData.length;
  const avgAccuracy =
    successCount > 0
      ? successData.reduce((sum, h) => sum + h.accuracy, 0) / successCount
      : 0;

  const handleView = (item: HistoryItem) => {
    // Save to last detection and navigate to report
    localStorage.setItem(
      "duriancount_last_detection",
      JSON.stringify({
        trees: item.trees,
        accuracy: item.accuracy,
        timestamp: new Date().toISOString(),
        filename: item.filename,
      })
    );
    navigate("/laporan");
  };

  const handleDownload = (item: HistoryItem) => {
    toast({
      title: "Download dimulai",
      description: `Mengunduh laporan ${item.id}...`,
    });
  };

  const handleDelete = (id: string) => {
    const updated = historyData.filter((item) => item.id !== id);
    setHistoryData(updated);
    localStorage.setItem("duriancount_history", JSON.stringify(updated));
    setDeleteId(null);
    toast({
      title: "Berhasil dihapus",
      description: `Riwayat ${id} telah dihapus.`,
    });
  };

  const handleExport = () => {
    toast({
      title: "Ekspor dimulai",
      description: "Mengunduh data riwayat...",
    });
  };

  return (
    <DashboardLayout
      title="Riwayat"
      description="Daftar proses deteksi yang telah dilakukan"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Summary - Dynamic from real data */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-2xl font-bold text-primary">
              {totalTrees.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total Pohon</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-2xl font-bold text-card-foreground">
              {successCount}
            </p>
            <p className="text-sm text-muted-foreground">Deteksi Berhasil</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-2xl font-bold text-card-foreground">
              {avgAccuracy > 0 ? `${avgAccuracy.toFixed(1)}%` : "–"}
            </p>
            <p className="text-sm text-muted-foreground">Rata-rata Akurasi</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
        </div>

        {/* History Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {historyData.length === 0
                ? "Belum ada riwayat deteksi. Mulai deteksi pertama Anda!"
                : "Tidak ada hasil yang cocok dengan pencarian."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Pohon</TableHead>
                  <TableHead>Akurasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.date}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {item.filename}
                    </TableCell>
                    <TableCell>
                      {item.status === "selesai" ? (
                        <span className="font-semibold text-primary">
                          {item.trees.toLocaleString()}
                        </span>
                      ) : (
                        "–"
                      )}
                    </TableCell>
                    <TableCell>
                      {item.status === "selesai" ? `${item.accuracy}%` : "–"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "selesai" ? "default" : "destructive"
                        }
                        className={
                          item.status === "selesai"
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : ""
                        }
                      >
                        {item.status === "selesai" ? "Selesai" : "Gagal"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleView(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={item.status !== "selesai"}
                          onClick={() => handleDownload(item)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(item.id)}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Riwayat?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus riwayat {deleteId}? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Riwayat;
