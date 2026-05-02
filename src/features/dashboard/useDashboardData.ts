import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getDashboardTrends,
  getLatestImages
} from "@/services/dashboard.service";

export const useDashboardSummary = (options?: { interval?: number; enabled?: boolean }) => {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => getDashboardSummary(),
    refetchInterval: options?.enabled ? (options?.interval ?? 30000) : false,
    retry: 3,
    staleTime: 10000,
    enabled: options?.enabled !== false,
  });
};

export const useDashboardTrends = (days: number, options?: { interval?: number; enabled?: boolean }) => {
  return useQuery({
    queryKey: ["dashboard", "trends", days],
    queryFn: () => getDashboardTrends({ days }),
    refetchInterval: options?.enabled ? (options?.interval ?? 30000) : false,
    retry: 3,
    staleTime: 10000,
    enabled: options?.enabled !== false,
  });
};

export const useLatestImages = (limit: number = 10, options?: { interval?: number; enabled?: boolean }) => {
  return useQuery({
    queryKey: ["dashboard", "latest-images", limit],
    queryFn: () => getLatestImages({ limit }),
    refetchInterval: options?.enabled ? (options?.interval ?? 15000) : false,
    retry: 3,
    staleTime: 5000,
    enabled: options?.enabled !== false,
  });
};
