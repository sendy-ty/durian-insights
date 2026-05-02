import { useMutation, useQuery } from "@tanstack/react-query";
import { newDetectionService } from "./detection.service";

export const useUploadFeature = () => {
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File, onProgress?: (p: number) => void }) =>
      newDetectionService.uploadImage(file, onProgress),
  });
};

export const useRunDetectionFeature = () => {
  return useMutation({
    mutationFn: (imageId: string) => newDetectionService.runDetection(imageId),
  });
};

export const useFeatureDetectionStatus = (taskId: string | null, isVisible: boolean) => {
  return useQuery({
    queryKey: ["feature-detection-status", taskId],
    queryFn: () => newDetectionService.getStatus(taskId!),
    enabled: !!taskId && isVisible,
    refetchInterval: (data: any) => {
      const resp = data?.data || data;
      const status = String(resp?.status || "").toLowerCase();
      // Keep polling if running or queued or pending
      if (status === "completed" || status === "success" || status === "failed") {
        return false;
      }
      return 1000;
    },
  });
};

export const useFeatureDetectionResults = (imageId: string | null, isFinished: boolean, isVisible: boolean) => {
  return useQuery({
    queryKey: ["feature-detection-results", imageId],
    queryFn: () => newDetectionService.getResults(imageId!),
    enabled: !!imageId && isFinished && isVisible,
    refetchInterval: (data: any) => {
      if (data?.status === "success" || data?.status === "completed") {
        return false;
      }
      return 1000;
    },
  });
};
