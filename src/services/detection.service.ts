import { apiClient } from "@/api/client";

export const detectionService = {
  run: async (imageId: string) => {
    const response = await apiClient.post(`/detection/run/${imageId}`);
    return response.data; // Expected { task_id }
  },
  getStatus: async (taskId: string) => {
    const response = await apiClient.get(`/tasks/status/${taskId}`);
    return response.data; // Expected { status, ... }
  },
  getResults: async (imageId: string) => {
    const response = await apiClient.get(`/detection/results/${imageId}`);
    return response.data; // Expected detection results
  },
};
