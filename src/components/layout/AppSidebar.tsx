import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  TreeDeciduous,
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
      localStorage.removeItem("duriancount_user");
      navigate("/");
    }
  };

  const logoutButton = (
    <button
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50"
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
        "fixed left-0 top-0 z-40 h-screen bg-[#0f172a] border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="flex h-20 items-center justify-between px-4 py-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 shadow-lg shadow-green-600/20">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-semibold text-white tracking-tight">
              DurianCount
            </span>
          )}
        </Link>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-10 w-10 mx-auto text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <ul className="flex flex-col gap-y-2">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            const linkContent = (
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-green-600/20 text-green-400 border-l-4 border-green-500 rounded-l-none"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-green-400" : "text-slate-400 group-hover:text-white"
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
                    <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700 font-medium">
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
      <div className="border-t border-slate-800 p-4">
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              {logoutButton}
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700 font-medium">
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
