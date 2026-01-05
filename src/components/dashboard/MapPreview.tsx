import detectionPreview from "@/assets/detection-preview.jpg";
import { MapPin, Layers, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function MapPreview() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card">
      {/* Map Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img
          src={detectionPreview}
          alt="Peta deteksi pohon durian"
          className="h-full w-full object-cover"
        />
        
        {/* Map Controls Overlay */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-card/90 backdrop-blur-sm shadow-md"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-card/90 backdrop-blur-sm shadow-md"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-card/90 backdrop-blur-sm shadow-md"
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 rounded-lg bg-card/90 backdrop-blur-sm p-3 shadow-md">
          <p className="text-xs font-medium text-muted-foreground mb-2">Legenda</p>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-xs font-medium text-card-foreground">Pohon Durian</span>
          </div>
        </div>

        {/* Coordinate Badge */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm shadow-md">
            <MapPin className="h-3 w-3 mr-1" />
            -7.4231°, 109.2378°
          </Badge>
        </div>
      </div>

      {/* Map Info Footer */}
      <div className="border-t border-border bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Skala 1:4.300</span>
            <span>WGS84 / UTM Zona 50S</span>
          </div>
          <span>Sumber: OpenArielMap</span>
        </div>
      </div>
    </div>
  );
}
