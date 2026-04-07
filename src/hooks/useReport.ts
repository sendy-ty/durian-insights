import { useMutation } from "@tanstack/react-query";
import { reportService } from "@/services/report.service";

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: (imageId: string) => reportService.generate(imageId),
  });
};
