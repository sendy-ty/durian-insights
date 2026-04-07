import { apiClient } from "@/api/client";

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface TileInfo {
  tile_url: string;
  min_zoom: number;
  max_zoom: number;
  bounds: MapBounds;
  tile_count?: number;
  crs?: string;
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface OrthomosaicInfo {
  image_url: string;
  bounds: MapBounds;
}

export const mapService = {
  getBounds: async (imageId: string): Promise<MapBounds> => {
    const response = await apiClient.get(`/map/bounds/${imageId}`);
    return response.data;
  },

  getTileInfo: async (imageId: string): Promise<TileInfo> => {
    const response = await apiClient.get(`/map/tiles/${imageId}`);
    return response.data;
  },

  /** GET /map/orthomosaic/{image_id} — returns the URL and bounds for the orthomosaic overlay */
  getOrthomosaic: async (imageId: string): Promise<OrthomosaicInfo> => {
    const response = await apiClient.get(`/map/orthomosaic/${imageId}`);
    return response.data;
  },

  getDetectionGeoJSON: async (imageId: string): Promise<GeoJSONCollection> => {
    const response = await apiClient.get(`/map/detections/${imageId}`);
    return response.data;
  },

  /** GET /map/durian-trees — returns all durian tree detections as GeoJSON (not image-specific) */
  getDurianTrees: async (): Promise<GeoJSONCollection> => {
    const response = await apiClient.get("/map/durian-trees");
    return response.data;
  },

  getTileUrl: (imageId: string): string => {
    return `/map/tiles/${imageId}/{z}/{x}/{y}.png`;
  },
};
