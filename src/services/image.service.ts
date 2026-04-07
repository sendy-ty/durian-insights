import { apiClient } from "@/api/client";

export interface ImageMeta {
  image_id: string;
  filename: string;
  file_size: number;
  upload_date: string;
  preview_url?: string;
  image_url?: string;
}

export interface ImageUploadResponse {
  image_id: string;
  filename: string;
  message: string;
}

export type ProgressCallback = (percent: number) => void;

export const imageService = {
  upload: async (
    file: File,
    onProgress?: ProgressCallback
  ): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 300_000, // 5 min for large uploads
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        }
      },
    });
    return response.data;
  },

  list: async (): Promise<ImageMeta[]> => {
    const response = await apiClient.get("/images/");
    return response.data;
  },

  getById: async (imageId: string): Promise<ImageMeta> => {
    const response = await apiClient.get(`/images/${imageId}`);
    return response.data;
  },

  delete: async (imageId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/images/${imageId}`);
    return response.data;
  },

  getPreviewUrl: (imageId: string): string => {
    return `/images/${imageId}/preview`;
  },
};
