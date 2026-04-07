import { useMutation, useQuery } from "@tanstack/react-query";
import { odmService } from "@/services/odm.service";
import type { ProgressCallback } from "@/services/image.service";

export const useUploadZip = () => {
  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: ProgressCallback;
    }) => odmService.uploadZip(file, onProgress),
  });
};

export const useProcessODM = () => {
  return useMutation({
    mutationFn: (projectId: string) => odmService.process(projectId),
  });
};

export const useODMStatus = (projectId: string | null, refetchInterval?: number) => {
  return useQuery({
    queryKey: ["odm-status", projectId],
    queryFn: () => odmService.getStatus(projectId!),
    enabled: !!projectId,
    refetchInterval: refetchInterval || false,
  });
};

export const useODMResult = (projectId: string | null, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["odm-result", projectId],
    queryFn: () => odmService.getResult(projectId!),
    enabled: !!projectId && enabled,
  });
};
