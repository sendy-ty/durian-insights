import React from "react";
import { Card } from "@/components/ui/card";
import { ImageIcon, TreeDeciduous, Calendar, ChevronRight } from "lucide-react";

interface LatestImagesProps {
  images: any[];
  isLoading?: boolean;
  onNavigate?: (id: string) => void;
}

const formatDate = (d: string | number | Date) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};

export const LatestImages: React.FC<LatestImagesProps> = ({ images, isLoading, onNavigate }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-20 rounded-xl bg-muted/20 border border-border" />
        ))}
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border-dashed border border-gray-200 dark:border-gray-700 rounded-xl h-full transition-colors">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Belum ada riwayat perhitungan. Silakan unggah citra untuk memulai.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {images.map((img, i) => (
        <div
          key={img.image_id || img.id || i}
          className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer group shadow-sm"
          onClick={() => onNavigate && onNavigate(img.image_id || img.id)}
        >
          {/* Kiri: Icon + Tanggal + Info Singkat */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <ImageIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                {formatDate(img.created_at || img.upload_date)}
              </span>
              <p className="text-sm text-gray-400 dark:text-gray-500 truncate" title={img.original_filename || img.filename}>
                {img.original_filename || img.filename || "Gambar Tanpa Nama"}
              </p>
            </div>
          </div>

          {/* Kanan: Badge */}
          <div className="shrink-0">
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium px-3 py-1 rounded-full">
              {img.tree_count || 0} Pohon
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
