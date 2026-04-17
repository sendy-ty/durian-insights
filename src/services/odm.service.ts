import { apiClient } from "@/api/client";
import type { ProgressCallback } from "@/services/image.service";

export const odmService = {
  uploadZip: async (file: File, onProgress?: ProgressCallback) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/odm/upload-zip", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 600_000, // 10 min for very large ZIP files
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        }
      },
    });
    return response; // Return full axios response object
  },
  process: async (projectId: string) => {
    if (!projectId) {
      console.error("odmService.process: projectId is undefined — aborting");
      throw new Error("project_id tidak valid.");
    }
    console.log(`[ODM] POST /odm/process/${projectId}`);
    const response = await apiClient.post(`/odm/process/${projectId}`);
    console.log("[ODM] process response:", response.data);
    return response.data;
  },
  getStatus: async (projectId: string) => {
    const response = await apiClient.get(`/odm/${projectId}/status`);
    return response.data; // Expected { status, progress, ... }
  },
  getResult: async (projectId: string) => {
    const response = await apiClient.get(`/odm/${projectId}/result`);
    return response.data; // Expected { image_id }
  },

};
