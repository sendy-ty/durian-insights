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
import { Search, Download, Eye, Trash2 } from "lucide-react";

interface HistoryItem {
  id: string;
  date: string;
  filename: string;
  trees: number;
  accuracy: number;
  status: "selesai" | "gagal";
}

const historyData: HistoryItem[] = [
  {
    id: "DET-001",
    date: "16 Nov 2025",
    filename: "survey_001.zip",
    trees: 1247,
    accuracy: 93.4,
    status: "selesai",
  },
  {
    id: "DET-002",
    date: "14 Nov 2025",
    filename: "survey_002.tiff",
    trees: 892,
    accuracy: 91.2,
    status: "selesai",
  },
  {
    id: "DET-003",
    date: "12 Nov 2025",
    filename: "area_b.zip",
    trees: 1105,
    accuracy: 94.1,
    status: "selesai",
  },
  {
    id: "DET-004",
    date: "10 Nov 2025",
    filename: "kebun_utara.jpg",
    trees: 756,
    accuracy: 92.8,
    status: "selesai",
  },
  {
    id: "DET-005",
    date: "08 Nov 2025",
    filename: "aerial_003.png",
    trees: 0,
    accuracy: 0,
    status: "gagal",
  },
  {
    id: "DET-006",
    date: "05 Nov 2025",
    filename: "farm_west.zip",
    trees: 2341,
    accuracy: 95.2,
    status: "selesai",
  },
];

const Riwayat = () => {
  const totalTrees = historyData
    .filter((h) => h.status === "selesai")
    .reduce((sum, h) => sum + h.trees, 0);
  const successCount = historyData.filter((h) => h.status === "selesai").length;
  const avgAccuracy =
    historyData
      .filter((h) => h.status === "selesai")
      .reduce((sum, h) => sum + h.accuracy, 0) / successCount;

  return (
    <DashboardLayout
      title="Riwayat"
      description="Daftar proses deteksi yang telah dilakukan"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Summary */}
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
              {avgAccuracy.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Rata-rata Akurasi</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari..." className="pl-10" />
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
        </div>

        {/* History Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
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
              {historyData.map((item) => (
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
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {item.status === "selesai" ? `${item.accuracy}%` : "-"}
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={item.status !== "selesai"}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Riwayat;