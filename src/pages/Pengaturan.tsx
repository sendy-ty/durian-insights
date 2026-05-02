import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
      title="Pengaturan Akun & Tampilan"
      description="Kelola informasi profil, keamanan akun, dan preferensi tampilan"
    >
      <div className="animate-fade-in w-full max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-2 items-start">

          {/* LEFT COLUMN: Profil & Pengaturan Akun */}
          <div className="space-y-6">
            {/* Profil Summary Card */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm flex flex-col items-center text-center animate-fade-in transition-colors">
              <Avatar className="h-24 w-24 mb-4 ring-4 ring-green-50 dark:ring-green-900/30">
                <AvatarFallback className="bg-green-600 text-white text-3xl font-bold">
                  {userData.initials}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {userData.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{userData.email}</p>
            </div>

            {/* Account Settings Form Card */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm space-y-6 transition-colors">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700">
                <Settings className="h-5 w-5 text-green-600 dark:text-green-500" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Informasi Akun
                </h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-green-600 focus:ring-green-600 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alamat Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-green-600 focus:ring-green-600 h-11"
                  />
                </div>

                <div className="pt-4 space-y-5 border-t border-gray-100 dark:border-gray-700">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kata Sandi Saat Ini</Label>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">Wajib diisi jika Anda ingin mengubah kata sandi lama.</p>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, currentPassword: e.target.value })
                        }
                        placeholder="Masukkan kata sandi lama"
                        className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-green-600 focus:ring-green-600 h-11"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kata Sandi Baru</Label>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">Gunakan minimal 6 karakter kombinasi huruf dan angka.</p>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, newPassword: e.target.value })
                        }
                        placeholder="Masukkan kata sandi baru"
                        className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-green-600 focus:ring-green-600 h-11"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Tema & Tombol Simpan */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm flex flex-col space-y-6 transition-colors">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700">
                <Palette className="h-5 w-5 text-green-600 dark:text-green-500" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Preferensi Tampilan
                </h2>
              </div>

              <div>
                <Label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 block">Pilih Tema</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex flex-col items-center gap-4 rounded-xl border-2 p-6 transition-all duration-200",
                      theme === "light"
                        ? "border-green-600 bg-green-50 dark:bg-green-900/20 shadow-sm"
                        : "border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 hover:border-green-400 dark:hover:border-green-600"
                    )}
                  >
                    <div className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
                      theme === "light" ? "bg-green-600 text-white" : "bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700"
                    )}>
                      <Sun className="h-7 w-7" />
                    </div>
                    <span className={cn("font-bold text-sm", theme === "light" ? "text-green-800 dark:text-green-400" : "text-gray-500 dark:text-gray-400")}>Mode Terang</span>
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex flex-col items-center gap-4 rounded-xl border-2 p-6 transition-all duration-200",
                      theme === "dark"
                        ? "border-green-600 bg-green-50 dark:bg-green-900/20 shadow-sm"
                        : "border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 hover:border-green-400 dark:hover:border-green-600"
                    )}
                  >
                    <div className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
                      theme === "dark" ? "bg-green-600 text-white" : "bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700"
                    )}>
                      <Moon className="h-7 w-7" />
                    </div>
                    <span className={cn("font-bold text-sm", theme === "dark" ? "text-green-800 dark:text-green-400" : "text-gray-500 dark:text-gray-400")}>Mode Gelap</span>
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 text-lg rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  onClick={handleSave}
                >
                  <Save className="h-5 w-5" />
                  Simpan Perubahan
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 border-green-600 dark:border-green-500 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-xl font-semibold"
                  onClick={() => navigate("/")}
                >
                  Kembali ke Beranda
                </Button>
              </div>
            </div>

            <div className="bg-green-50/50 dark:bg-green-900/10 p-6 rounded-xl border border-green-100 dark:border-green-900/30">
              <p className="text-xs text-green-800 dark:text-green-400 font-medium leading-relaxed">
                <strong>Tips:</strong> Pengaturan ini akan disimpan secara lokal di perangkat Anda. Jika Anda keluar (logout), preferensi tampilan mungkin akan kembali ke pengaturan awal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Pengaturan;
