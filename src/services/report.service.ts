import { apiClient } from "@/api/client";

export const reportService = {
  generate: async (imageId: string) => {
    const response = await apiClient.post(`/reports/generate/${imageId}`);
    return response.data; // { report_url: string }
  },
};
