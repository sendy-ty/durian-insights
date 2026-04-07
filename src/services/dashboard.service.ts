import { apiClient } from "@/api/client";

export interface DashboardStats {
  total_trees: number;
  total_detections: number;
  total_area_hectares: number;
  average_accuracy: number;
  last_detection_date: string | null;
}

export interface DetectionTrend {
  period: string;
  count: number;
}

export interface LatestImage {
  image_id: string;
  filename: string;
  upload_date: string;
  preview_url?: string;
}

export interface DashboardSummary {
  stats: DashboardStats;
  trends: DetectionTrend[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get("/dashboard/stats");
    return response.data;
  },

  getSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get("/dashboard/summary");
    return response.data;
  },

  getTrends: async (): Promise<DetectionTrend[]> => {
    const response = await apiClient.get("/dashboard/trends");
    return response.data;
  },

  getLatestImages: async (): Promise<LatestImage[]> => {
    const response = await apiClient.get("/dashboard/latest-images");
    return response.data;
  },
};
