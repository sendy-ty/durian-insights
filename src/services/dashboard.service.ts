import { apiClient } from "@/api/client";

import { AxiosRequestConfig } from "axios";

export async function getDashboardSummary(config?: AxiosRequestConfig) {
  const res = await apiClient.get("/dashboard/summary", config);
  return res.data?.data;
}

export async function getDashboardTrends(config?: AxiosRequestConfig & { days?: number }) {
  const days = config?.days || 7;
  const res = await apiClient.get(`/dashboard/trends?days=${days}`, config);
  return res.data?.data;
}

export async function getLatestImages(config?: AxiosRequestConfig & { limit?: number }) {
  const limit = config?.limit || 5;
  const res = await apiClient.get(`/dashboard/latest-images?limit=${limit}`, config);
  return res.data?.data;
}
