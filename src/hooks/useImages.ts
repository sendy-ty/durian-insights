import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { imageService } from "@/services/image.service";

export const useUploadImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (percent: number) => void }) => 
      imageService.upload(file, onProgress),
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
