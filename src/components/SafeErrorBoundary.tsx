import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class SafeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[SafeErrorBoundary] Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-6 bg-background text-foreground rounded-xl border border-dashed border-red-500/50 my-4">
          <div className="max-w-md w-full p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Terjadi Kesalahan</h2>
              <p className="text-sm text-muted-foreground">
                Gagal memuat komponen ini. Mohon coba muat ulang halaman.
              </p>
            </div>

            <Button 
              variant="outline"
              onClick={() => window.location.reload()} 
              className="flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset Halaman
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SafeErrorBoundary;
