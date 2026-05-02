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
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);

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
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="w-full max-w-6xl mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 shadow-lg shadow-green-600/20">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">DurianCount</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => scrollToAuth("login")}
              className="text-white hover:bg-white/10 font-semibold rounded-xl px-4"
            >
              Masuk
            </Button>
            <Button
              onClick={() => scrollToAuth("register")}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 font-semibold shadow-sm transition-all"
            >
              Buat Akun
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center py-12">
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Left: Academic Title */}
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                <span className="text-white block">
                  Sistem Penghitungan Pohon Durian Secara Otomatis
                </span>
                <span className="text-green-400 block mt-3 text-2xl sm:text-3xl">
                  Berbasis Citra UAV dan Machine Learning
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Platform berbasis web untuk mendeteksi dan menghitung jumlah pohon durian secara otomatis menggunakan citra udara (drone).
              </p>
            </div>

            {/* Right: Auth Card */}
            <div id="auth-card" className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <Card className="border border-white/10 bg-black/70 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
                      <TabsTrigger
                        value="login"
                        className="rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:bg-white/10 data-[state=inactive]:hover:text-white"
                      >
                        Masuk
                      </TabsTrigger>
                      <TabsTrigger
                        value="register"
                        className="rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:bg-white/10 data-[state=inactive]:hover:text-white"
                      >
                        Buat Akun
                      </TabsTrigger>
                    </TabsList>

                    {/* Login Tab */}
                    <TabsContent value="login" className="space-y-6">
                      <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="login-email" className="text-gray-200 font-medium">Masukkan Username</Label>
                          <Input
                            id="login-email"
                            name="email"
                            type="text"
                            placeholder="Masukkan username"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            required
                            className="bg-transparent border border-white/20 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-6"
                          />
                        </div>
                        <div className="space-y-2 relative">
                          <Label htmlFor="login-password" className="text-gray-200 font-medium">Kata Sandi</Label>
                          <div className="relative">
                            <Input
                              id="login-password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Masukkan kata sandi"
                              value={loginData.password}
                              onChange={handleLoginChange}
                              required
                              className="bg-transparent border border-white/20 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-6 pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 text-base font-semibold shadow-sm transition-all"
                          disabled={isSubmitting}
                        >
                          {loginMutation.isPending ? "Memproses..." : "Masuk"}
                        </Button>
                      </form>
                      <p className="text-sm text-center text-gray-400 pt-4 border-t border-white/10">
                        Belum memiliki akun?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("register")}
                          className="text-green-400 hover:text-green-300 hover:underline font-semibold transition-colors"
                        >
                          Buat akun di sini
                        </button>
                      </p>
                    </TabsContent>

                    {/* Register Tab */}
                    <TabsContent value="register" className="space-y-6">
                      <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="register-name" className="text-gray-200 font-medium">Username</Label>
                          <Input
                            id="register-name"
                            name="name"
                            type="text"
                            placeholder="Masukkan username"
                            value={registerData.name}
                            onChange={handleRegisterChange}
                            required
                            className="bg-transparent border border-white/20 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-6"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-email" className="text-gray-200 font-medium">Email</Label>
                          <Input
                            id="register-email"
                            name="email"
                            type="email"
                            placeholder="Masukkan Email Anda"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            required
                            className="bg-transparent border border-white/20 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-6"
                          />
                        </div>
                        <div className="space-y-2 relative">
                          <Label htmlFor="register-password" className="text-gray-200 font-medium">Kata Sandi</Label>
                          <div className="relative">
                            <Input
                              id="register-password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Minimal 6 karakter"
                              value={registerData.password}
                              onChange={handleRegisterChange}
                              onFocus={() => setShowPasswordTooltip(true)}
                              onBlur={() => setShowPasswordTooltip(false)}
                              required
                              className="bg-transparent border border-white/20 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-6 pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>

                          {/* Tooltip */}
                          <div className={`absolute z-50 left-0 w-full mt-2 transition-all duration-200 ${showPasswordTooltip ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
                            <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-sm text-gray-600 relative">
                              <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
                              <p className="font-semibold text-gray-800 mb-2">Kata sandi harus terdiri dari:</p>
                              <ul className="space-y-1 ml-4 list-disc marker:text-green-500">
                                <li>Minimal 8 karakter</li>
                                <li>Huruf besar (A-Z)</li>
                                <li>Huruf kecil (a-z)</li>
                                <li>Angka (0-9)</li>
                                <li>Simbol (!@#$%)</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-confirm" className="text-gray-200 font-medium">Konfirmasi Kata Sandi</Label>
                          <div className="relative">
                            <Input
                              id="register-confirm"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Ulangi kata sandi"
                              value={registerData.confirmPassword}
                              onChange={handleRegisterChange}
                              required
                              className="bg-transparent border border-white/20 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 rounded-xl px-4 py-6 pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 text-base font-semibold shadow-sm transition-all"
                          disabled={isSubmitting}
                        >
                          {registerMutation.isPending ? "Membuat akun..." : "Buat Akun"}
                        </Button>
                      </form>
                      <p className="text-sm text-center text-gray-400 pt-4 border-t border-white/10">
                        Sudah memiliki akun?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("login")}
                          className="text-green-400 hover:text-green-300 hover:underline font-semibold transition-colors"
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
      <footer className="relative z-10 py-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="text-center text-sm text-gray-400 opacity-70 space-y-1">
            <p>© 2026 DurianCount</p>
            <p>Dikembangkan oleh Tim Capstone, Telkom University Purwokerto</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
