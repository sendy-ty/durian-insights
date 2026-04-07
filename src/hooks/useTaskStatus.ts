import { useQuery } from "@tanstack/react-query";
import { taskService } from "@/services/task.service";

export const useTaskStatus = (taskId: string | null, refetchInterval?: number) => {
  return useQuery({
    queryKey: ["task-status", taskId],
    queryFn: () => taskService.getStatus(taskId!),
    enabled: !!taskId,
    refetchInterval: refetchInterval || false,
  });
};
