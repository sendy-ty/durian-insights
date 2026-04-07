import { useQuery } from "@tanstack/react-query";
import { mapService } from "@/services/map.service";

export const useMapBounds = (imageId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["map-bounds", imageId],
    queryFn: () => mapService.getBounds(imageId!),
    enabled: !!imageId && enabled,
  });
};

export const useMapTileInfo = (imageId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["map-tile-info", imageId],
    queryFn: () => mapService.getTileInfo(imageId!),
    enabled: !!imageId && enabled,
  });
};

export const useMapOrthomosaic = (imageId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["map-orthomosaic", imageId],
    queryFn: () => mapService.getOrthomosaic(imageId!),
    enabled: !!imageId && enabled,
  });
};

export const useMapDetections = (imageId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["map-detections", imageId],
    queryFn: () => mapService.getDetectionGeoJSON(imageId!),
    enabled: !!imageId && enabled,
  });
};

export const useDurianTrees = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["map-durian-trees"],
    queryFn: () => mapService.getDurianTrees(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};
