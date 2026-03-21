import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useStore } from "@/contexts/StoreContext";
import { Users, Phone, Mail, MapPin, DollarSign, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Supplier } from "@/data/store-data";

const Suppliers = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, isLoadingSuppliers } = useStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", totalPurchases: 0 });

  const resetForm = () => setForm({ name: "", phone: "", email: "", address: "", totalPurchases: 0 });

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("أدخل اسم المورد"); return; }
    let success = false;
    if (editSupplier) {
      success = await updateSupplier({ ...editSupplier, ...form });
      if (success) {
        toast.success("تم تحديث المورد");
        setEditSupplier(null);
      }
    } else {
      success = await addSupplier(form);
      if (success) {
        toast.success("تم إضافة المورد");
        setIsAddOpen(false);
      }
    }
    if (success) resetForm();
    else toast.error("حدث خطأ ما");
  };

  const openEdit = (s: Supplier) => {
    setForm({ name: s.name, phone: s.phone, email: s.email, address: s.address, totalPurchases: s.totalPurchases });
    setEditSupplier(s);
  };

  const supplierFormJSX = (
    <div className="space-y-6 py-2">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 border-b pb-2">
          <Users className="w-4 h-4" /> هوية المورد
        </h3>
        <div className="space-y-2">
          <label className="text-xs font-medium pr-1 text-foreground">اسم المورد الكامل</label>
          <div className="relative">
            <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="مثال: شركة سامسونج الرسمية" className="pr-10" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 border-b pb-2">
          <Phone className="w-4 h-4" /> معلومات الاتصال
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium pr-1">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="0555000000" className="pr-10 font-mono" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium pr-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="contact@supplier.com" className="pr-10 font-mono" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium pr-1">العنوان الجغرافي</label>
          <div className="relative">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="المنطقة الصناعية، الجزائر" className="pr-10" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 border-b pb-2">
          <DollarSign className="w-4 h-4" /> البيانات المالية
        </h3>
        <div className="space-y-2">
          <label className="text-xs font-medium pr-1 text-profit">إجمالي قيمة المشتريات (د.ج)</label>
          <div className="relative">
            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="number" placeholder="0" className="pr-10 font-bold" value={form.totalPurchases || ""} onChange={e => setForm(f => ({ ...f, totalPurchases: +e.target.value }))} />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} className="w-full h-11 text-base font-bold active:scale-[0.98] transition-transform">{editSupplier ? "تحديث بيانات المورد" : "إضافة المورد للقائمة"}</Button>
    </div>
  );

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-info" />
            الموردين
          </h1>
          <Dialog open={isAddOpen} onOpenChange={o => { setIsAddOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4" /> إضافة مورد</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>إضافة مورد جديد</DialogTitle></DialogHeader>
              {supplierFormJSX}
            </DialogContent>
          </Dialog>
        </div>

        {isLoadingSuppliers ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map(s => (
                <div key={s.id} className="bg-card rounded-xl border p-4 space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-base">{s.name}</h3>
                    <div className="flex gap-1">
                      <Dialog open={editSupplier?.id === s.id} onOpenChange={o => { if (!o) { setEditSupplier(null); resetForm(); } }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>تعديل المورد</DialogTitle></DialogHeader>
                          {supplierFormJSX}
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { deleteSupplier(s.id); toast.success("تم حذف المورد"); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-info" />{s.phone}</p>
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" />{s.email}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-revenue" />{s.address}</p>
                    <p className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-profit" />إجمالي المشتريات: {s.totalPurchases.toLocaleString()} د.ج</p>
                  </div>
                </div>
              ))}
            </div>
            {suppliers.length === 0 && <p className="text-center py-8 text-muted-foreground">لا يوجد موردين</p>}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Suppliers;
