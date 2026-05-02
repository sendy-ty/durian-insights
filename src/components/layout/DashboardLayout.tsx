import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";
import { Menu, Bell, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function DashboardLayout({
  children,
  title,
  description,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();

  const userName = user?.name || "User";
  const userInitials = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      localStorage.removeItem("duriancount_user");
      navigate("/");
    } catch {
      localStorage.removeItem("duriancount_user");
      navigate("/");
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Sidebar - hidden on mobile by default */}
      <div
        className={cn(
          "lg:block",
          isMobile ? (mobileMenuOpen ? "block" : "hidden") : ""
        )}
      >
        <AppSidebar
          isCollapsed={isMobile ? false : isCollapsed}
          onToggle={() => {
            if (isMobile) {
              setMobileMenuOpen(false);
            } else {
              setIsCollapsed(!isCollapsed);
            }
          }}
        />
      </div>

      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isMobile ? "ml-0" : isCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-800/60 px-4 lg:px-6 transition-colors">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-600 dark:text-gray-300"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div>
              {title && (
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-green-600 text-white border-2 border-white dark:border-gray-800">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all cursor-pointer group">
                  <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-green-100 dark:group-hover:ring-green-900 transition-all">
                    <AvatarFallback className="bg-green-600 text-white text-xs font-bold flex items-center justify-center">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                    {userName}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl shadow-lg border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <DropdownMenuLabel className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 py-2">Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-700" />
                <DropdownMenuItem asChild className="rounded-lg mx-1 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-100">
                  <Link to="/pengaturan" className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg mx-1 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-100">
                  <Link to="/pengaturan" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span>Pengaturan</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-700" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-lg mx-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/20"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {logoutMutation.isPending ? "Keluar..." : "Keluar"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 min-h-[calc(100vh-64px)]">{children}</main>
      </div>
    </div>
  );
}
