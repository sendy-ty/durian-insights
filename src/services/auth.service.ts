import { apiClient } from "@/api/client";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: UserProfile;
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/register", payload, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  },

  login: async (payload: LoginPayload): Promise<any> => {
    console.log("LOGIN REQUEST:", payload);
    const response = await apiClient.post("/auth/login", payload, {
      headers: { "Content-Type": "application/json" }
    });
    console.log("LOGIN RESPONSE:", response);
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  /** GET /auth/me — returns the current authenticated user or 401 */
  me: async (): Promise<UserProfile> => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  },
};
