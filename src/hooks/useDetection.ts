import { useMutation, useQuery } from "@tanstack/react-query";
import { detectionService } from "@/services/detection.service";

export const useRunDetection = () => {
  return useMutation({
    mutationFn: (imageId: string) => detectionService.run(imageId),
  });
};

export const useDetectionStatus = (taskId: string | null, refetchInterval?: number) => {
  return useQuery({
    queryKey: ["detection-status", taskId],
    queryFn: () => detectionService.getStatus(taskId!),
    enabled: !!taskId,
    refetchInterval: refetchInterval || false,
  });
};

export const useDetectionResults = (imageId: string | null, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["detection-results", imageId],
    queryFn: () => detectionService.getResults(imageId!),
    enabled: !!imageId && enabled,
  });
};
