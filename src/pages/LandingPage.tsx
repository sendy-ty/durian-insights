import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/api/client";
import durianOrchardBg from "@/assets/durian-orchard-hero.jpg";

const LandingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await loginMutation.mutateAsync({
        username: loginData.email,
        password: loginData.password,
      }) as any;

      console.log("LOGIN RESPONSE:", response);

      // Use raw response status for session-based auth validation
      const status = response?.status || response?.data?.status;
      
      // Allow login solely if status is success (no JWT strictly required)
      const isSuccess = status === "success" || response?.message === "Login successful" || response?.data?.message === "Login successful";

      if (isSuccess) {
        // We use a dummy token marker if using session cookie auth, to satisfy ProtectedRoute
        localStorage.setItem("duriancount_token", "session_active");

        const data = response?.data || response;

        // Persist user info
        const userData = data?.user || {
          name: loginData.email.split('@')[0],
          email: loginData.email,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(
          "duriancount_user",
          JSON.stringify({
            name: userData.name,
            email: userData.email,
            createdAt: userData.created_at || userData.createdAt,
          })
        );

        toast({
          title: "Berhasil masuk",
          description: `Selamat datang kembali, ${userData.name || "Pengguna"}.`,
        });
        // Force hard redirect to bypass router cache and sync fully
        window.location.href = "/dashboard";
      } else {
        throw new Error("Respon login tidak valid");
      }
    } catch (err) {
      toast({
        title: "Gagal masuk",
        description: getApiErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = registerData.name?.trim() || "";
    const email = registerData.email?.trim() || "";
    const password = registerData.password || "";

    if (!fullName || !email || !password) {
      toast({
        title: "Data tidak lengkap",
        description: "Semua kolom wajib diisi.",
        variant: "destructive",
      });
      return;
    }

    if (password !== registerData.confirmPassword) {
      toast({
        title: "Kata sandi tidak cocok",
        description: "Pastikan konfirmasi kata sandi sesuai.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Kata sandi terlalu pendek",
        description: "Kata sandi minimal 6 karakter.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      username: fullName,
      email: email,
      password: password,
    };

    console.log("Register payload:", payload);

    try {
      const data = await registerMutation.mutateAsync(payload);

      // Persist for sidebar display compatibility
      localStorage.setItem(
        "duriancount_user",
        JSON.stringify({
          name: data.user?.name,
          email: data.user?.email,
          createdAt: data.user?.created_at,
        })
      );

      toast({
        title: "Akun berhasil dibuat",
        description: "Selamat datang di DurianCount.",
      });
      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Gagal membuat akun",
        description: getApiErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  const scrollToAuth = (tab: string) => {
    setActiveTab(tab);
    document.getElementById("auth-card")?.scrollIntoView({ behavior: "smooth" });
  };

  const isSubmitting = loginMutation.isPending || registerMutation.isPending;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: `url(${durianOrchardBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Header */}
      <header className="relative z-10 border-b border-primary/20 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-white">DurianCount</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => scrollToAuth("login")}
              className="text-white/90 hover:bg-primary/20 hover:text-white border border-primary/30"
            >
              Masuk
            </Button>
            <Button
              onClick={() => scrollToAuth("register")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Buat Akun
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            {/* Left: Academic Title */}
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
                <span className="text-white block">
                  Aplikasi Web Penghitungan Pohon Durian Otomatis
                </span>
                <span className="text-primary/80 block mt-2">
                  Berbasis Citra UAV dan Machine Learning
                </span>
              </h1>
              <p className="text-base lg:text-lg text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Platform Berbasis Web Untuk Mendeteksi dan Menghitung Pohon Durian Secara Otomatis Melalui Citra Udara Drone Dengan Dukungan Algoritma Machine Learning.
              </p>
            </div>

            {/* Right: Auth Card */}
            <div id="auth-card" className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <Card className="border-primary/20 bg-black/40 backdrop-blur-md shadow-2xl">
                <CardContent className="pt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/30 border border-primary/20">
                      <TabsTrigger
                        value="login"
                        className="text-white/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        Masuk
                      </TabsTrigger>
                      <TabsTrigger
                        value="register"
                        className="text-white/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        Buat Akun
                      </TabsTrigger>
                    </TabsList>

                    {/* Login Tab */}
                    <TabsContent value="login" className="space-y-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email" className="text-white/90">Email atau Username</Label>
                          <Input
                            id="login-email"
                            name="email"
                            type="text"
                            placeholder="nama@contoh.com"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            required
                            className="bg-black/30 border-primary/30 text-white placeholder:text-white/50 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password" className="text-white/90">Kata Sandi</Label>
                          <div className="relative">
                            <Input
                              id="login-password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Masukkan kata sandi"
                              value={loginData.password}
                              onChange={handleLoginChange}
                              required
                              className="bg-black/30 border-primary/30 text-white placeholder:text-white/50 focus:border-primary pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          disabled={isSubmitting}
                        >
                          {loginMutation.isPending ? "Memproses..." : "Masuk"}
                        </Button>
                      </form>
                      <p className="text-sm text-center text-white/70 pt-2">
                        Belum memiliki akun?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("register")}
                          className="text-primary hover:underline font-medium"
                        >
                          Buat akun di sini
                        </button>
                      </p>
                    </TabsContent>

                    {/* Register Tab */}
                    <TabsContent value="register" className="space-y-4">
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-name" className="text-white/90">Nama Lengkap</Label>
                          <Input
                            id="register-name"
                            name="name"
                            type="text"
                            placeholder="Masukkan nama lengkap"
                            value={registerData.name}
                            onChange={handleRegisterChange}
                            required
                            className="bg-black/30 border-primary/30 text-white placeholder:text-white/50 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-email" className="text-white/90">Email</Label>
                          <Input
                            id="register-email"
                            name="email"
                            type="email"
                            placeholder="nama@contoh.com"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            required
                            className="bg-black/30 border-primary/30 text-white placeholder:text-white/50 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-password" className="text-white/90">Kata Sandi</Label>
                          <div className="relative">
                            <Input
                              id="register-password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Minimal 6 karakter"
                              value={registerData.password}
                              onChange={handleRegisterChange}
                              required
                              className="bg-black/30 border-primary/30 text-white placeholder:text-white/50 focus:border-primary pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-confirm" className="text-white/90">Konfirmasi Kata Sandi</Label>
                          <div className="relative">
                            <Input
                              id="register-confirm"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Ulangi kata sandi"
                              value={registerData.confirmPassword}
                              onChange={handleRegisterChange}
                              required
                              className="bg-black/30 border-primary/30 text-white placeholder:text-white/50 focus:border-primary pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          disabled={isSubmitting}
                        >
                          {registerMutation.isPending ? "Membuat akun..." : "Buat Akun"}
                        </Button>
                      </form>
                      <p className="text-sm text-center text-white/70 pt-2">
                        Sudah memiliki akun?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("login")}
                          className="text-primary hover:underline font-medium"
                        >
                          Masuk di sini
                        </button>
                      </p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-4 border-t border-primary/20 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-white/70 space-y-1">
            <p>© 2026 DurianCount</p>
            <p>Dikembangkan oleh Tim Capstone, Telkom University Purwokerto</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
