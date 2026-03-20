import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useStore } from "@/contexts/StoreContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState(settings);

  const handleSave = () => {
    if (!form.storeName.trim()) { toast.error("أدخل اسم المتجر"); return; }
    updateSettings(form);
    toast.success("تم حفظ الإعدادات");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          الإعدادات
        </h1>

        <div className="bg-card rounded-xl border p-6 space-y-4">
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
      </div>
    </DashboardLayout>
  );
};

export default Settings;
