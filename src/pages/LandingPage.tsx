import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Target, TreeDeciduous, FileText, Leaf, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const features = [
  {
    icon: Map,
    title: "Pemetaan Citra Drone",
    description: "Pembuatan peta digital dari citra udara drone.",
  },
  {
    icon: Target,
    title: "Deteksi Pohon Durian",
    description: "Identifikasi pohon durian berbasis AI dari peta digital.",
  },
  {
    icon: TreeDeciduous,
    title: "Perhitungan Pohon",
    description: "Penghitungan jumlah pohon secara otomatis dan terukur.",
  },
  {
    icon: FileText,
    title: "Laporan Analisis",
    description: "Penyajian hasil deteksi dalam bentuk data visual dan laporan.",
  },
];

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

    // Simulate login check
    await new Promise((resolve) => setTimeout(resolve, 800));

    const storedUser = localStorage.getItem("duriancount_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.email === loginData.email) {
        toast({
          title: "Berhasil masuk",
          description: `Selamat datang kembali, ${user.name}!`,
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

    // Simulate account creation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Store user data in localStorage
    localStorage.setItem(
      "duriancount_user",
      JSON.stringify({
        name: registerData.name,
        email: registerData.email,
        createdAt: new Date().toISOString(),
      })
    );

    toast({
      title: "Akun berhasil dibuat",
      description: "Selamat datang di DurianCount.",
    });

    // Redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">DurianCount</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab("login")}
              className="hidden sm:inline-flex"
            >
              Masuk
            </Button>
            <Button onClick={() => setActiveTab("register")}>
              Buat Akun
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16">
        <div className="container mx-auto px-4 py-12 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: Title & Description */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Analisis Pohon Durian Berbasis Citra Drone
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Platform analisis yang memanfaatkan citra drone untuk pemetaan dan deteksi pohon durian secara otomatis.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                  size="lg" 
                  onClick={() => setActiveTab("login")}
                  variant="outline"
                >
                  Masuk ke Dashboard
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => setActiveTab("register")}
                >
                  Buat Akun & Mulai Analisis
                </Button>
              </div>
            </div>

            {/* Right: Auth Card */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <Card className="border-border shadow-lg">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-xl text-center">
                    {activeTab === "login" ? "Masuk ke Sistem" : "Buat Akun Baru"}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {activeTab === "login" 
                      ? "Masukkan kredensial untuk melanjutkan" 
                      : "Lengkapi data untuk membuat akun"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="login">Masuk</TabsTrigger>
                      <TabsTrigger value="register">Buat Akun</TabsTrigger>
                    </TabsList>

                    {/* Login Tab */}
                    <TabsContent value="login" className="space-y-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
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
                          {isSubmitting ? "Membuat akun..." : "Buat Akun & Lanjutkan"}
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
      </section>

      {/* Features Section */}
      <section className="py-16 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-border">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} DurianCount. Sistem analisis pohon durian berbasis citra drone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
