import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";

import Dashboard from "./pages/Dashboard";
import DeteksiPohon from "./pages/DeteksiPohon";
import PetaDigital from "./pages/PetaDigital";
import Laporan from "./pages/Laporan";
import Riwayat from "./pages/Riwayat";
import Pengaturan from "./pages/Pengaturan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(2000 * 2 ** attempt, 10000),
      staleTime: 60 * 1000,       // 1 minute
      gcTime: 10 * 60 * 1000,     // 10 minutes
      refetchOnWindowFocus: false, // prevent surprise refetches
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Initialize theme on app load
function ThemeInitializer() {
  useEffect(() => {
    const theme = localStorage.getItem("duriancount-theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  return null;
}

import SafeErrorBoundary from "./components/SafeErrorBoundary";

const App = () => (
  <SafeErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Protected routes wrapped in individual ErrorBoundaries for isolation */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deteksi"
              element={
                <ProtectedRoute>
                  <SafeErrorBoundary>
                    <DeteksiPohon />
                  </SafeErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/peta"
              element={
                <ProtectedRoute>
                  <SafeErrorBoundary>
                    <PetaDigital />
                  </SafeErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/laporan"
              element={
                <ProtectedRoute>
                  <Laporan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/riwayat"
              element={
                <ProtectedRoute>
                  <Riwayat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pengaturan"
              element={
                <ProtectedRoute>
                  <Pengaturan />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </SafeErrorBoundary>
);

export default App;
