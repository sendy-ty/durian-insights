import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  TreeDeciduous,
  FileText,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Leaf,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useLogout } from "@/hooks/useAuth";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Map, label: "Peta Digital", path: "/peta" },
  { icon: TreeDeciduous, label: "Deteksi Pohon", path: "/deteksi" },
  { icon: FileText, label: "Laporan", path: "/laporan" },
  { icon: History, label: "Riwayat", path: "/riwayat" },
  { icon: Settings, label: "Pengaturan", path: "/pengaturan" },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      localStorage.removeItem("duriancount_user");
      toast({
        title: "Berhasil keluar",
        description: "Sampai jumpa kembali!",
      });
      navigate("/");
    } catch {
      // Even if the API call fails, clear local state and redirect
      localStorage.removeItem("duriancount_user");
      navigate("/");
    }
  };

  const logoutButton = (
    <button
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted hover:bg-sidebar-accent hover:text-destructive transition-all duration-150 disabled:opacity-50"
    >
      {logoutMutation.isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <LogOut className="h-5 w-5" />
      )}
      {!isCollapsed && <span>{logoutMutation.isPending ? "Keluar..." : "Keluar"}</span>}
    </button>
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Leaf className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">
              DurianCount
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            const linkContent = (
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                    : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-sidebar-primary" : ""
                  )}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );

            return (
              <li key={item.path}>
                {isCollapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-sidebar-border p-3">
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              {logoutButton}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Keluar
            </TooltipContent>
          </Tooltip>
        ) : (
          logoutButton
        )}
      </div>
    </aside>
  );
}
