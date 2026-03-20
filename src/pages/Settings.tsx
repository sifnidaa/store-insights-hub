import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Settings = () => {
  const { settings, updateSettings } = useStore();
  const { role } = useAuth();
  const [form, setForm] = useState(settings);

  const isAdmin = role === "admin";

  const handleSave = async () => {
    if (!form.storeName.trim()) { toast.error("أدخل اسم المتجر"); return; }
    const success = await updateSettings(form);
    if (success) toast.success("تم حفظ الإعدادات");
    else toast.error("فشل حفظ الإعدادات");
  };

  const applyTheme = async (theme: "light" | "dark") => {
    const next = { ...form, theme };
    setForm(next);
    await updateSettings(next);
  };

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("الرجاء رفع ملف صورة");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : null;
      if (!dataUrl) return;
      const next = { ...form, logoUrl: dataUrl };
      setForm(next);
      updateSettings(next);
      toast.success("تم تحديث شعار المتجر");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    const next = { ...form, logoUrl: null };
    setForm(next);
    updateSettings(next);
    toast.success("تم إزالة الشعار");
  };

  // User management is now handled via Supabase dashboard or admin API

  return (
    <DashboardLayout allowedRoles={["admin", "seller"]}>
      <div className="space-y-4 max-w-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          الإعدادات
        </h1>

        <div className="bg-card rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">المظهر</h2>
              <p className="text-sm text-muted-foreground">التبديل بين الوضع الفاتح والداكن</p>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-sm text-muted-foreground">فاتح</Label>
              <Switch checked={form.theme === "dark"} onCheckedChange={c => applyTheme(c ? "dark" : "light")} />
              <Label className="text-sm text-muted-foreground">داكن</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>شعار المتجر</Label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-muted/50 border flex items-center justify-center overflow-hidden">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-xs text-muted-foreground">بدون شعار</div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => handleLogoUpload(e.target.files?.[0] ?? null)}
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleRemoveLogo} disabled={!form.logoUrl}>
                    إزالة
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4" />

          <div className="space-y-2">
            <label className="text-sm font-medium">اسم المتجر</label>
            <Input value={form.storeName} onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">رقم الهاتف</label>
            <Input value={form.storePhone} onChange={e => setForm(f => ({ ...f, storePhone: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">العنوان</label>
            <Input value={form.storeAddress} onChange={e => setForm(f => ({ ...f, storeAddress: e.target.value }))} />
          </div>
          <Button onClick={handleSave} className="w-full">
            <Save className="w-4 h-4" /> حفظ الإعدادات
          </Button>
        </div>

        {isAdmin && (
          <div className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">إدارة المستخدمين</h2>
            <p className="text-sm text-muted-foreground">يتم إدارة المستخدمين والأدوار من خلال لوحة تحكم Supabase.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
