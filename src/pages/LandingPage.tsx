import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TreeDeciduous, Map, FileText, Target, ArrowRight, Leaf } from "lucide-react";
import heroImage from "@/assets/durian-orchard-hero.jpg";

const features = [
  {
    icon: Map,
    title: "Pemetaan Digital",
    description: "Buat peta digital dari citra drone menggunakan OpenDroneMap",
  },
  {
    icon: Target,
    title: "Deteksi AI",
    description: "Deteksi otomatis pohon durian dengan model YOLOv11",
  },
  {
    icon: TreeDeciduous,
    title: "Hitung Pohon",
    description: "Hitung jumlah pohon dengan akurasi tinggi",
  },
  {
    icon: FileText,
    title: "Laporan Otomatis",
    description: "Generate laporan lengkap hasil deteksi",
  },
];

const LandingPage = () => {
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
          <Button asChild>
            <Link to="/daftar">
              Buat Akun
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Kebun durian dari udara"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Hitung Pohon Durian dengan{" "}
              <span className="text-primary">Teknologi AI</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Sistem deteksi otomatis pohon durian menggunakan citra drone dan
              kecerdasan buatan. Akurat, cepat, dan mudah digunakan.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/daftar">
                  Buat Akun & Mulai
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Fitur Utama
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Semua yang Anda butuhkan untuk menghitung pohon durian
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Mulai Sekarang
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Daftarkan akun Anda dan mulai mendeteksi pohon durian dengan
            teknologi AI terdepan.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link to="/daftar">
                Buat Akun & Mulai
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 DurianCount. Sistem Deteksi Pohon Durian Berbasis AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
