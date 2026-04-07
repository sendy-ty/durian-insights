import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authService,
  LoginPayload,
  RegisterPayload,
} from "@/services/auth.service";

/** Key shared across all auth-related queries */
export const AUTH_QUERY_KEY = ["auth-me"] as const;

/**
 * GET /auth/me — returns the current user or undefined when unauthenticated.
 * retry: false so a 401 doesn't spam the backend.
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => authService.me(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const result = await authService.login(payload);
      const user = await authService.me();
      return { message: result.message, user };
    },
    onSuccess: (data) => {
      // Seed the cache so ProtectedRoute shows immediately
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const result = await authService.register(payload);
      const user = await authService.me();
      return { message: result.message, user };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
    },
  });
};

/** Legacy alias — same as useCurrentUser */
export const useProfile = useCurrentUser;
