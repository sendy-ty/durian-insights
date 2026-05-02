import { apiClient } from "@/api/client";

export const newDetectionService = {
  uploadImage: async (file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 0,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          onProgress(percent);
        }
      },
    });

    // Correctly parse nested data: { status: "success", data: { id: 123, ... } }
    const imageId = response.data?.data?.id;

    if (!imageId) {
      console.error("UPLOAD RESPONSE:", response.data);
      throw new Error("ID gambar tidak ditemukan dari server");
    }

    return {
      image_id: String(imageId),
      url: response.data?.data?.url,
      status: response.data?.status,
      message: response.data?.message
    };
  },
  runDetection: async (imageId: string) => {
    const response = await apiClient.post(`/detection/run/${imageId}`);
    return response.data;
  },
  getStatus: async (taskId: string) => {
    // Tries detection/status specifically to align with requirements
    const response = await apiClient.get(`/detection/status/${taskId}`);
    return response.data;
  },
  getResults: async (imageId: string) => {
    const response = await apiClient.get(`/detection/results/${imageId}`);
    const backendData = response.data?.data;
    const fallbackData = response.data;

    return {
      tree_count: Number(backendData?.tree_count ?? backendData?.trees ?? fallbackData?.tree_count ?? fallbackData?.trees ?? 0),
      detections: backendData?.detections ?? backendData?.bboxes ?? fallbackData?.detections ?? fallbackData?.bboxes ?? [],
      annotated_url: backendData?.annotated_url ?? fallbackData?.annotated_url ?? null,
      status: response.data?.status
    };
  },
  getAnnotatedImageUrl: (imageId: string) => {
    // Direct static path from backend reports volume, bypassing /api proxy
    return `/reports/annotated/${imageId}_annotated.jpg`;
  },
  normalizeUrl: (url: string | undefined | null) => {
    if (!url) return "";
    return url.replace(":8080", "");
  },
  generateReport: async (imageId: string) => {
    const response = await apiClient.post(`/reports/generate/${imageId}`, {}, {
      headers: { "Accept": "application/json" }
    });

    // Backend returns: { status: "success", data: { report_url: "..." } }
    const reportUrl = response.data?.data?.report_url;

    console.log("REPORT RESPONSE:", response.data);
    console.log("REPORT URL:", reportUrl);

    if (!reportUrl) {
      throw new Error("Report URL tidak ditemukan dari backend");
    }

    return {
      status: response.data?.status,
      reportUrl,
    };
  },
};
