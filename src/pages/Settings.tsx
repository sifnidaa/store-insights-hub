import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useStore } from "@/contexts/StoreContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Settings = () => {
  const { settings, updateSettings, role, users, addUser, deleteUser } = useStore();
  const [form, setForm] = useState(settings);

  const isAdmin = role === "admin";

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "seller" as "admin" | "seller",
  });

  const handleSave = () => {
    if (!form.storeName.trim()) { toast.error("أدخل اسم المتجر"); return; }
    updateSettings(form);
    toast.success("تم حفظ الإعدادات");
  };

  const applyTheme = (theme: "light" | "dark") => {
    const next = { ...form, theme };
    setForm(next);
    updateSettings(next);
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
      const next = { ...form, logoDataUrl: dataUrl };
      setForm(next);
      updateSettings(next);
      toast.success("تم تحديث شعار المتجر");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    const next = { ...form, logoDataUrl: null };
    setForm(next);
    updateSettings(next);
    toast.success("تم إزالة الشعار");
  };

  const handleAddUser = () => {
    if (!newUser.username.trim()) { toast.error("أدخل اسم المستخدم"); return; }
    if (!newUser.password.trim()) { toast.error("أدخل كلمة المرور"); return; }

    const exists = users.some(u => u.username === newUser.username);
    if (exists) { toast.error("اسم المستخدم موجود مسبقا"); return; }

    addUser({ username: newUser.username.trim(), password: newUser.password, role: newUser.role });
    toast.success("تم إضافة المستخدم");
    setNewUser({ username: "", password: "", role: "seller" });
  };

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
                {form.logoDataUrl ? (
                  <img src={form.logoDataUrl} alt="logo" className="w-full h-full object-contain" />
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
                  <Button variant="outline" className="flex-1" onClick={handleRemoveLogo} disabled={!form.logoDataUrl}>
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

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="اسم المستخدم"
                  value={newUser.username}
                  onChange={e => setNewUser(n => ({ ...n, username: e.target.value }))}
                />
                <Input
                  placeholder="كلمة المرور"
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser(n => ({ ...n, password: e.target.value }))}
                />
              </div>

              <select
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
                value={newUser.role}
                onChange={e => setNewUser(n => ({ ...n, role: e.target.value as "admin" | "seller" }))}
              >
                <option value="admin">admin</option>
                <option value="seller">seller</option>
              </select>

              <Button onClick={handleAddUser} className="w-full">
                إضافة مستخدم
              </Button>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">المستخدمون</h3>
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا يوجد مستخدمين</p>
              ) : (
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{u.username}</div>
                        <div className="text-xs text-muted-foreground">{u.role}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          // Optional: prevent deleting the last admin.
                          if (u.role === "admin" && users.filter(x => x.role === "admin").length <= 1) {
                            toast.error("لا يمكن حذف آخر admin");
                            return;
                          }
                          deleteUser(u.id);
                          toast.success("تم حذف المستخدم");
                        }}
                        disabled={u.username === "admin" && u.role === "admin" && users.filter(x => x.role === "admin").length <= 1}
                      >
                        حذف
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
