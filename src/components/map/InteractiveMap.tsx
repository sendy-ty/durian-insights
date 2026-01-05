import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeMarker {
  id: number;
  lat: number;
  lng: number;
}

interface InteractiveMapProps {
  className?: string;
  showControls?: boolean;
  markers?: TreeMarker[];
  showLayers?: boolean;
}

// Generate sample tree markers around the center
const generateSampleMarkers = (count: number): TreeMarker[] => {
  const centerLat = -7.4231;
  const centerLng = 109.2378;
  const markers: TreeMarker[] = [];

  for (let i = 0; i < count; i++) {
    markers.push({
      id: i,
      lat: centerLat + (Math.random() - 0.5) * 0.02,
      lng: centerLng + (Math.random() - 0.5) * 0.02,
    });
  }

  return markers;
};

export function InteractiveMap({
  className,
  showControls = true,
  markers = generateSampleMarkers(50),
  showLayers = true,
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [layerVisible, setLayerVisible] = useState(true);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainer.current, {
      center: [-7.4231, 109.2378],
      zoom: 15,
      zoomControl: false,
    });

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // Create custom tree icon
    const treeIcon = L.divIcon({
      className: "custom-tree-marker",
      html: `<div style="width: 12px; height: 12px; background-color: hsl(147, 50%, 47%); border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    // Create markers layer group
    const markersLayer = L.layerGroup();
    markers.forEach((marker) => {
      L.marker([marker.lat, marker.lng], { icon: treeIcon }).addTo(markersLayer);
    });
    markersLayer.addTo(map);

    markersLayerRef.current = markersLayer;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [markers]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleResetView = () => {
    mapRef.current?.setView([-7.4231, 109.2378], 15);
  };

  const toggleLayer = () => {
    if (!mapRef.current || !markersLayerRef.current) return;

    if (layerVisible) {
      markersLayerRef.current.remove();
    } else {
      markersLayerRef.current.addTo(mapRef.current);
    }
    setLayerVisible(!layerVisible);
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border", className)}>
      <div ref={mapContainer} className="h-full w-full min-h-[400px]" />

      {/* Map Controls */}
      {showControls && (
        <div className="absolute right-4 top-4 flex flex-col gap-2 z-[1000]">
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 bg-card/95 backdrop-blur-sm shadow-md"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 bg-card/95 backdrop-blur-sm shadow-md"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 bg-card/95 backdrop-blur-sm shadow-md"
            onClick={handleResetView}
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
          {showLayers && (
            <Button
              size="icon"
              variant={layerVisible ? "default" : "secondary"}
              className={cn(
                "h-10 w-10 shadow-md",
                !layerVisible && "bg-card/95 backdrop-blur-sm"
              )}
              onClick={toggleLayer}
            >
              <Layers className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded-lg bg-card/95 backdrop-blur-sm p-3 shadow-md z-[1000]">
        <p className="text-xs font-medium text-muted-foreground mb-2">Legenda</p>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary border border-card" />
          <span className="text-xs font-medium text-card-foreground">
            Pohon Durian ({markers.length})
          </span>
        </div>
      </div>
    </div>
  );
}
