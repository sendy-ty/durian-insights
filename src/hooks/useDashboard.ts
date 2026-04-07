import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => dashboardService.getSummary(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useDashboardTrends = () => {
  return useQuery({
    queryKey: ["dashboard-trends"],
    queryFn: () => dashboardService.getTrends(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useLatestImages = () => {
  return useQuery({
    queryKey: ["dashboard-latest-images"],
    queryFn: () => dashboardService.getLatestImages(),
    staleTime: 2 * 60 * 1000,
  });
};
