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
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", totalPurchases: 0 });

  const resetForm = () => setForm({ name: "", phone: "", email: "", address: "", totalPurchases: 0 });

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("أدخل اسم المورد"); return; }
    if (editSupplier) {
      updateSupplier({ ...editSupplier, ...form });
      toast.success("تم تحديث المورد");
      setEditSupplier(null);
    } else {
      addSupplier(form);
      toast.success("تم إضافة المورد");
      setIsAddOpen(false);
    }
    resetForm();
  };

  const openEdit = (s: Supplier) => {
    setForm({ name: s.name, phone: s.phone, email: s.email, address: s.address, totalPurchases: s.totalPurchases });
    setEditSupplier(s);
  };

  const SupplierForm = () => (
    <div className="space-y-3">
      <Input placeholder="اسم المورد" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      <Input placeholder="رقم الهاتف" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
      <Input placeholder="البريد الإلكتروني" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      <Input placeholder="العنوان" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
      <Input type="number" placeholder="إجمالي المشتريات" value={form.totalPurchases || ""} onChange={e => setForm(f => ({ ...f, totalPurchases: +e.target.value }))} />
      <Button onClick={handleSave} className="w-full">{editSupplier ? "تحديث" : "إضافة"}</Button>
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
              <SupplierForm />
            </DialogContent>
          </Dialog>
        </div>

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
                      <SupplierForm />
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
      </div>
    </DashboardLayout>
  );
};

export default Suppliers;
