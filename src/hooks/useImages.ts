import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { imageService } from "@/services/image.service";

export const useUploadImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, onProgress, signal }: { file: File; onProgress?: (percent: number) => void; signal?: AbortSignal }) => 
      imageService.upload(file, onProgress, signal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
};

export const useImages = () => {
  return useQuery({
    queryKey: ["images"],
    queryFn: () => imageService.list(),
  });
};

export const useImage = (imageId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["image", imageId],
    queryFn: () => imageService.getById(imageId!),
    enabled: !!imageId && enabled,
  });
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => imageService.delete(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
};
