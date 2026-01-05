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
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Calendar,
  TreeDeciduous,
} from "lucide-react";

interface HistoryItem {
  id: string;
  date: string;
  filename: string;
  trees: number;
  accuracy: number;
  model: string;
  status: "completed" | "processing" | "failed";
}

const historyData: HistoryItem[] = [
  {
    id: "DET-001",
    date: "16 Nov 2025, 14:30",
    filename: "drone_survey_001.zip",
    trees: 1247,
    accuracy: 93.4,
    model: "YOLOv8",
    status: "completed",
  },
  {
    id: "DET-002",
    date: "14 Nov 2025, 10:15",
    filename: "drone_survey_002.tiff",
    trees: 892,
    accuracy: 91.2,
    model: "YOLOv8",
    status: "completed",
  },
  {
    id: "DET-003",
    date: "12 Nov 2025, 16:45",
    filename: "area_b_mapping.zip",
    trees: 1105,
    accuracy: 94.1,
    model: "Faster R-CNN",
    status: "completed",
  },
  {
    id: "DET-004",
    date: "10 Nov 2025, 09:20",
    filename: "survey_kebun_utara.jpg",
    trees: 756,
    accuracy: 92.8,
    model: "YOLOv8",
    status: "completed",
  },
  {
    id: "DET-005",
    date: "08 Nov 2025, 11:00",
    filename: "aerial_view_003.png",
    trees: 0,
    accuracy: 0,
    model: "YOLOv8",
    status: "failed",
  },
  {
    id: "DET-006",
    date: "05 Nov 2025, 13:30",
    filename: "durian_farm_west.zip",
    trees: 2341,
    accuracy: 95.2,
    model: "YOLOv8",
    status: "completed",
  },
];

const Riwayat = () => {
  return (
    <DashboardLayout
      title="Riwayat Deteksi"
      description="Daftar semua proses deteksi yang telah dilakukan"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari deteksi..."
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Ekspor Data
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TreeDeciduous className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">6,341</p>
                <p className="text-xs text-muted-foreground">Total Pohon</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">6</p>
                <p className="text-xs text-muted-foreground">Total Deteksi</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-lg font-bold text-primary">%</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">93.3%</p>
                <p className="text-xs text-muted-foreground">Rata-rata Akurasi</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-sm font-bold text-primary">✓</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">5</p>
                <p className="text-xs text-muted-foreground">Berhasil</p>
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>ID</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama File</TableHead>
                <TableHead>Pohon</TableHead>
                <TableHead>Akurasi</TableHead>
                <TableHead>Model</TableHead>
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
                  <TableCell className="max-w-[200px] truncate">
                    {item.filename}
                  </TableCell>
                  <TableCell>
                    {item.status === "completed" ? (
                      <span className="font-semibold text-primary">
                        {item.trees.toLocaleString()}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {item.status === "completed" ? `${item.accuracy}%` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {item.model}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "completed"
                          ? "default"
                          : item.status === "processing"
                          ? "secondary"
                          : "destructive"
                      }
                      className={
                        item.status === "completed"
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : ""
                      }
                    >
                      {item.status === "completed"
                        ? "Selesai"
                        : item.status === "processing"
                        ? "Proses"
                        : "Gagal"}
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
                        disabled={item.status !== "completed"}
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

        {/* Footer */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Dikembangkan oleh Tim Capstone • Telkom University Purwokerto
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Riwayat;
