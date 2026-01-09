import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Palette, Save, Camera, Moon, Sun, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Pengaturan = () => {
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "Sandy Tirta Yudha",
    email: "sandy@telkomuniversity.ac.id",
    currentPassword: "",
    newPassword: "",
  });

  const handleSave = () => {
    // Save to localStorage
    const userData = JSON.parse(localStorage.getItem("duriancount_user") || "{}");
    userData.name = formData.name;
    userData.email = formData.email;
    if (formData.newPassword && formData.currentPassword) {
      userData.password = formData.newPassword;
    }
    localStorage.setItem("duriancount_user", JSON.stringify(userData));

    toast({
      title: "Berhasil disimpan",
      description: "Pengaturan akun telah diperbarui.",
    });
  };

  return (
    <DashboardLayout
      title="Pengaturan"
      description="Kelola preferensi akun dan tampilan"
    >
      <div className="animate-fade-in h-[calc(100vh-8rem)] overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-2 h-full">
          {/* Profile Section */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">
                Profil Pengguna
              </h2>
            </div>

            <div className="flex flex-col gap-6 flex-1">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      SY
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-6 w-6 rounded-full shadow-md"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <p className="font-medium text-card-foreground">{formData.name}</p>
                  <p className="text-sm text-muted-foreground">{formData.email}</p>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Password Change */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Kata Sandi Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, currentPassword: e.target.value })
                      }
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Kata Sandi Baru</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, newPassword: e.target.value })
                      }
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">
                Tampilan
              </h2>
            </div>

            <div className="flex-1">
              <Label className="mb-4 block">Tema Aplikasi</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all hover:border-primary/50",
                    theme === "light"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <Sun className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium text-card-foreground">Terang</span>
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all hover:border-primary/50",
                    theme === "dark"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <Moon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium text-card-foreground">Gelap</span>
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6 pt-4 border-t border-border">
              <Button className="w-full" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Simpan Pengaturan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Pengaturan;
