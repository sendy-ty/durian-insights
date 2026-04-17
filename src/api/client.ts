import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 120000, // 2 min default timeout (uploads override this) 
});

// ---------------------------------------------------------------------------
// Request Interceptor — Attach Authorization header if token exists
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("duriancount_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response Interceptor — Global error handling + 401 redirect
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Auth expiration: redirect to login on 401
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      // Don't redirect if this is the auth-check call itself (avoids redirect loop)
      const isAuthCheck = url.includes("/auth/me") || url.includes("/auth/login") || url.includes("/auth/register");

      if (!isAuthCheck) {
        console.warn("[AUTH] 401 Unauthorized - Clearing session and redirecting.");
        // Clear all session data
        localStorage.clear();
        // Use window.location so it works outside of React Router context
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Error message helper — extract the most useful message from an Axios error
// ---------------------------------------------------------------------------
export function getApiErrorMessage(error: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi."): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const data = error.response?.data as Record<string, unknown> | undefined;

  // FastAPI-style: { detail: "..." }
  if (typeof data?.detail === "string") return data.detail;

  // Array-style validation: { detail: [{ msg: "..." }] }
  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    return (data.detail[0] as { msg?: string }).msg || fallback;
  }

  // Generic: { message: "..." } or { error: "..." }
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;

  // Network / timeout errors
  if (error.code === "ECONNABORTED") return "Koneksi timeout. Periksa jaringan Anda.";
  if (error.code === "ERR_NETWORK") return "Tidak dapat terhubung ke server.";

  // HTTP status fallback
  const status = error.response?.status;
  if (status === 403) return "Anda tidak memiliki akses.";
  if (status === 404) return "Data tidak ditemukan.";
  if (status === 413) return "File terlalu besar.";
  if (status === 422) return "Data tidak valid.";
  if (status === 500) return "Kesalahan server internal.";

  return fallback;
}
