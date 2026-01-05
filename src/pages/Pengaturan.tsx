import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bell, Cpu, Palette, Save, Camera } from "lucide-react";

const Pengaturan = () => {
  return (
    <DashboardLayout
      title="Pengaturan"
      description="Kelola preferensi akun dan sistem"
    >
      <div className="space-y-6 animate-fade-in max-w-3xl">
        {/* Profile Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Profil
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  SY
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full shadow-md"
              >
                <Camera className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama</Label>
                  <Input id="fullName" defaultValue="Sandy Tirta Yudha" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="sandy@telkomuniversity.ac.id"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Notifikasi
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">
                  Notifikasi Email
                </p>
                <p className="text-sm text-muted-foreground">
                  Terima notifikasi melalui email
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">
                  Deteksi Selesai
                </p>
                <p className="text-sm text-muted-foreground">
                  Notifikasi saat proses selesai
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* System Info - No longer editable */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Cpu className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Informasi Sistem
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-sm text-muted-foreground">Model AI</span>
              <span className="text-sm font-medium text-card-foreground">
                YOLOv11
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-sm text-muted-foreground">
                Versi Sistem
              </span>
              <span className="text-sm font-medium text-card-foreground">
                1.0.0
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-sm text-muted-foreground">
                Mapping Engine
              </span>
              <span className="text-sm font-medium text-card-foreground">
                OpenDroneMap
              </span>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Tampilan
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tema</Label>
              <Select defaultValue="light">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Terang</SelectItem>
                  <SelectItem value="dark">Gelap</SelectItem>
                  <SelectItem value="system">Ikuti Sistem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bahasa</Label>
              <Select defaultValue="id">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Simpan
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Pengaturan;