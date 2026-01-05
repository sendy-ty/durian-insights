import { Clock, TreeDeciduous, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Detection {
  id: string;
  date: string;
  trees: number;
  accuracy: number;
  model: string;
}

const recentDetections: Detection[] = [
  {
    id: "DET-001",
    date: "16 Nov 2025",
    trees: 1247,
    accuracy: 93.4,
    model: "YOLOv8",
  },
  {
    id: "DET-002",
    date: "14 Nov 2025",
    trees: 892,
    accuracy: 91.2,
    model: "YOLOv8",
  },
  {
    id: "DET-003",
    date: "12 Nov 2025",
    trees: 1105,
    accuracy: 94.1,
    model: "Faster R-CNN",
  },
  {
    id: "DET-004",
    date: "10 Nov 2025",
    trees: 756,
    accuracy: 92.8,
    model: "YOLOv8",
  },
];

export function RecentDetections() {
  return (
    <div className="space-y-4">
      {recentDetections.map((detection) => (
        <div
          key={detection.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TreeDeciduous className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">
                {detection.id}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {detection.date}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-card-foreground">
                {detection.trees.toLocaleString()} pohon
              </p>
              <div className="flex items-center justify-end gap-1 text-xs text-primary">
                <TrendingUp className="h-3 w-3" />
                {detection.accuracy}%
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {detection.model}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
