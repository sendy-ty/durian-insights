import { apiClient } from "@/api/client";

export interface TaskStatus {
  task_id: string;
  status: "PENDING" | "STARTED" | "PROGRESS" | "SUCCESS" | "COMPLETED" | "FAILED" | "RETRY";
  progress?: number;
  result?: Record<string, unknown>;
  error?: string;
}

export const taskService = {
  getStatus: async (taskId: string): Promise<TaskStatus> => {
    const response = await apiClient.get(`/tasks/status/${taskId}`);
    return response.data;
  },
};
