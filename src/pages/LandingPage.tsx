import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import durianOrchardBg from "@/assets/durian-orchard-hero.jpg";

const LandingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const storedUser = localStorage.getItem("duriancount_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.email === loginData.email && user.password === loginData.password) {
        toast({
          title: "Berhasil masuk",
          description: `Selamat datang kembali, ${user.name}.`,
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Gagal masuk",
          description: "Email atau kata sandi tidak sesuai.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Akun tidak ditemukan",
        description: "Silakan buat akun terlebih dahulu.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Kata sandi tidak cocok",
        description: "Pastikan konfirmasi kata sandi sesuai.",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: "Kata sandi terlalu pendek",
        description: "Kata sandi minimal 6 karakter.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Store user data including password for login validation
    localStorage.setItem(
      "duriancount_user",
      JSON.stringify({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        createdAt: new Date().toISOString(),
      })
    );

    toast({
      title: "Akun berhasil dibuat",
      description: "Selamat datang di DurianCount.",
    });

    navigate("/dashboard");
  };

  const scrollToAuth = (tab: string) => {
    setActiveTab(tab);
    document.getElementById("auth-card")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url(${durianOrchardBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-sm">
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
              className="text-white hover:bg-white/10 hover:text-white"
            >
              Masuk
            </Button>
            <Button 
              onClick={() => scrollToAuth("register")}
              className="bg-primary hover:bg-primary/90"
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
            <div className="space-y-4 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-white leading-tight">
                APLIKASI WEBSITE
                <br />
                PENGHITUNG POHON DURIAN
                <br />
                OTOMATIS BERBASIS
                <br />
                <span className="text-primary">CITRA UDARA DAN MACHINE LEARNING</span>
              </h1>
              <p className="text-base lg:text-lg text-white/80 max-w-lg mx-auto lg:mx-0">
                Sistem analisis otomatis untuk mendeteksi dan menghitung pohon durian menggunakan teknologi pemetaan citra drone dan algoritma machine learning.
              </p>
            </div>

            {/* Right: Auth Card */}
            <div id="auth-card" className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <Card className="border-white/10 bg-card/95 backdrop-blur-md shadow-2xl">
                <CardContent className="pt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="login">Masuk</TabsTrigger>
                      <TabsTrigger value="register">Buat Akun</TabsTrigger>
                    </TabsList>

                    {/* Login Tab */}
                    <TabsContent value="login" className="space-y-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email atau Username</Label>
                          <Input
                            id="login-email"
                            name="email"
                            type="email"
                            placeholder="nama@contoh.com"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Kata Sandi</Label>
                          <div className="relative">
                            <Input
                              id="login-password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Masukkan kata sandi"
                              value={loginData.password}
                              onChange={handleLoginChange}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? "Memproses..." : "Masuk"}
                        </Button>
                      </form>
                      <p className="text-sm text-center text-muted-foreground pt-2">
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
                          <Label htmlFor="register-name">Nama Lengkap</Label>
                          <Input
                            id="register-name"
                            name="name"
                            type="text"
                            placeholder="Masukkan nama lengkap"
                            value={registerData.name}
                            onChange={handleRegisterChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-email">Email</Label>
                          <Input
                            id="register-email"
                            name="email"
                            type="email"
                            placeholder="nama@contoh.com"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-password">Kata Sandi</Label>
                          <div className="relative">
                            <Input
                              id="register-password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Minimal 6 karakter"
                              value={registerData.password}
                              onChange={handleRegisterChange}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-confirm">Konfirmasi Kata Sandi</Label>
                          <div className="relative">
                            <Input
                              id="register-confirm"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Ulangi kata sandi"
                              value={registerData.confirmPassword}
                              onChange={handleRegisterChange}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? "Membuat akun..." : "Buat Akun"}
                        </Button>
                      </form>
                      <p className="text-sm text-center text-muted-foreground pt-2">
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
      <footer className="relative z-10 py-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-white/60">
            © 2026 DurianCount · Sistem analisis pohon durian berbasis citra udara
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
