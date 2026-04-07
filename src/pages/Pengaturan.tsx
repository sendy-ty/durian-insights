import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, Palette, Save, Moon, Sun, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Pengaturan = () => {
  const { theme, setTheme } = useTheme();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    initials: "U",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });

  // Load user data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("duriancount_user");
    if (stored) {
      const user = JSON.parse(stored);
      setUserData({
        name: user.name || "Pengguna",
        email: user.email || "",
        initials: user.name
          ? user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "U",
      });
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, []);

  const handleSave = () => {
    const storedUser = JSON.parse(localStorage.getItem("duriancount_user") || "{}");

    // Validate current password if trying to change password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        toast({
          title: "Gagal menyimpan",
          description: "Masukkan kata sandi saat ini untuk mengubah kata sandi.",
          variant: "destructive",
        });
        return;
      }
      if (storedUser.password !== formData.currentPassword) {
        toast({
          title: "Gagal menyimpan",
          description: "Kata sandi saat ini tidak sesuai.",
          variant: "destructive",
        });
        return;
      }
      if (formData.newPassword.length < 6) {
        toast({
          title: "Gagal menyimpan",
          description: "Kata sandi baru minimal 6 karakter.",
          variant: "destructive",
        });
        return;
      }
      storedUser.password = formData.newPassword;
    }

    // Update user data
    storedUser.name = formData.name;
    storedUser.email = formData.email;
    localStorage.setItem("duriancount_user", JSON.stringify(storedUser));

    // Update display
    setUserData({
      name: formData.name,
      email: formData.email,
      initials: formData.name
        ? formData.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U",
    });

    // Clear password fields
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
    }));

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
        <div className="grid gap-6 lg:grid-cols-3 h-full">
          {/* Section 1: Informasi Akun (Read-only) */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">
                Informasi Akun
              </h2>
            </div>

            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {userData.initials}
                </AvatarFallback>
              </Avatar>
              <p className="text-lg font-semibold text-card-foreground">
                {userData.name}
              </p>
              <p className="text-sm text-muted-foreground">{userData.email}</p>
            </div>
          </div>

          {/* Section 2: Pengaturan Akun (Editable) */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">
                Pengaturan Akun
              </h2>
            </div>

            <div className="space-y-4 flex-1">
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

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Kata Sandi Saat Ini</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
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
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
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

          {/* Section 3: Tampilan Aplikasi */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">
                Tampilan Aplikasi
              </h2>
            </div>

            <div className="flex-1">
              <Label className="mb-4 block">Tema</Label>
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
