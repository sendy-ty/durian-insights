import { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapBounds, GeoJSONCollection } from "@/services/map.service";

interface TreeMarker {
  id: number;
  lat: number;
  lng: number;
  label?: string;
  confidence?: number;
}

interface InteractiveMapProps {
  className?: string;
  showControls?: boolean;
  markers?: TreeMarker[];
  showLayers?: boolean;
  /** Direct image URL for a simple overlay (legacy) */
  imageUrl?: string;
  /** Backend bounds for the orthomosaic overlay */
  imageBounds?: MapBounds;
  /** Backend GeoJSON detection data — takes precedence over markers */
  geojsonData?: GeoJSONCollection;
  /** Map center override [lat, lng] */
  center?: [number, number];
  /** Map zoom override */
  zoom?: number;
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

const defaultMarkers = generateSampleMarkers(50);

export function InteractiveMap({
  className,
  showControls = true,
  markers,
  showLayers = true,
  imageUrl,
  imageBounds,
  geojsonData,
  center,
  zoom,
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [layerVisible, setLayerVisible] = useState(true);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const overlayRef = useRef<L.ImageOverlay | null>(null);

  // Determine the effective center & zoom from bounds or props
  const mapCenter = center || [-7.4231, 109.2378] as [number, number];
  const mapZoom = zoom || 15;

  // Determine markers: GeoJSON → explicit markers → default sample
  const effectiveMarkers = useMemo<TreeMarker[]>(() => {
    if (geojsonData && geojsonData.features.length > 0) {
      return geojsonData.features.map((f, i) => {
        const coords = f.geometry.coordinates as number[];
        return {
          id: i,
          lat: coords[1],
          lng: coords[0],
          label: (f.properties.label as string) || undefined,
          confidence: (f.properties.confidence as number) || undefined,
        };
      });
    }
    if (markers) return markers;
    return defaultMarkers;
  }, [geojsonData, markers]);

  const treeCount = effectiveMarkers.length;

  // Convert backend MapBounds to Leaflet bounds
  const leafletBounds = useMemo<L.LatLngBoundsExpression | null>(() => {
    if (imageBounds) {
      return [
        [imageBounds.south, imageBounds.west],
        [imageBounds.north, imageBounds.east],
      ];
    }
    return null;
  }, [imageBounds]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Destroy previous map if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize map
    const map = L.map(mapContainer.current, {
      center: mapCenter,
      zoom: mapZoom,
      zoomControl: false,
    });

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // Add image overlay if available
    if (imageUrl) {
      const bounds: L.LatLngBoundsExpression = leafletBounds || [
        [-7.43, 109.22],
        [-7.41, 109.25],
      ];
      const overlay = L.imageOverlay(imageUrl, bounds, { opacity: 0.9 }).addTo(map);
      overlayRef.current = overlay;

      // Fit map to overlay bounds
      map.fitBounds(bounds);
    } else if (leafletBounds) {
      map.fitBounds(leafletBounds);
    }

    // Create custom tree icon
    const treeIcon = L.divIcon({
      className: "custom-tree-marker",
      html: `<div style="width: 12px; height: 12px; background-color: hsl(147, 50%, 47%); border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    // Create markers layer group
    const markersLayer = L.layerGroup();
    effectiveMarkers.forEach((marker) => {
      const m = L.marker([marker.lat, marker.lng], { icon: treeIcon }).addTo(
        markersLayer
      );
      // Add popup with info if available
      if (marker.label || marker.confidence != null) {
        const parts: string[] = [];
        if (marker.label) parts.push(`<b>${marker.label}</b>`);
        if (marker.confidence != null) parts.push(`Confidence: ${(marker.confidence * 100).toFixed(1)}%`);
        m.bindPopup(parts.join("<br/>"));
      }
    });
    markersLayer.addTo(map);

    markersLayerRef.current = markersLayer;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveMarkers, imageUrl, leafletBounds]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleResetView = () => {
    if (leafletBounds && mapRef.current) {
      mapRef.current.fitBounds(leafletBounds);
    } else {
      mapRef.current?.setView(mapCenter, mapZoom);
    }
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
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border",
        className
      )}
    >
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
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Legenda
        </p>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary border border-card" />
          <span className="text-xs font-medium text-card-foreground">
            Pohon Durian ({treeCount})
          </span>
        </div>
      </div>
    </div>
  );
}
