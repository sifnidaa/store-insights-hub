import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useStore } from "@/contexts/StoreContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/store-data";
import { Search, Package, AlertTriangle, Plus, Pencil, Trash2, Download } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Product } from "@/data/store-data";
import * as XLSX from "xlsx";

const Inventory = () => {
  const { products, addProduct, updateProduct, deleteProduct, suppliers } = useStore();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("الكل");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "الكل" || p.category === catFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, catFilter]);

  const [form, setForm] = useState({
    name: "", category: categories[0], price: 0, cost: 0, stock: 0, minStock: 0, sku: "", supplier: "",
  });

  const resetForm = () => setForm({ name: "", category: categories[0], price: 0, cost: 0, stock: 0, minStock: 0, sku: "", supplier: "" });

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("أدخل اسم المنتج"); return; }
    if (editProduct) {
      updateProduct({ ...editProduct, ...form });
      toast.success("تم تحديث المنتج");
      setEditProduct(null);
    } else {
      addProduct(form);
      toast.success("تم إضافة المنتج");
      setIsAddOpen(false);
    }
    resetForm();
  };

  const openEdit = (p: Product) => {
    const supplierExists = suppliers.some(s => s.id === p.supplier);
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      minStock: p.minStock,
      sku: p.sku,
      supplier: supplierExists ? p.supplier : "",
    });
    setEditProduct(p);
  };

  const exportToExcel = () => {
    const data = products.map(p => ({
      "المنتج": p.name,
      "القسم": p.category,
      "سعر البيع": p.price,
      "سعر التكلفة": p.cost,
      "المخزون": p.stock,
      "الحد الأدنى": p.minStock,
      "SKU": p.sku,
      "المورد": suppliers.find(s => s.id === p.supplier)?.name || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المخزون");
    XLSX.writeFile(wb, "inventory.xlsx");
    toast.success("تم تحميل ملف Excel");
  };

  const ProductForm = () => (
    <div className="space-y-3">
      <Input placeholder="اسم المنتج" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      <select className="w-full h-10 rounded-lg border bg-background px-3 text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" placeholder="سعر البيع" value={form.price || ""} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} />
        <Input type="number" placeholder="سعر التكلفة" value={form.cost || ""} onChange={e => setForm(f => ({ ...f, cost: +e.target.value }))} />
        <Input type="number" placeholder="الكمية" value={form.stock || ""} onChange={e => setForm(f => ({ ...f, stock: +e.target.value }))} />
        <Input type="number" placeholder="الحد الأدنى" value={form.minStock || ""} onChange={e => setForm(f => ({ ...f, minStock: +e.target.value }))} />
      </div>
      <Input placeholder="رمز المنتج SKU" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
      <select className="w-full h-10 rounded-lg border bg-background px-3 text-sm" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}>
        <option value="">بدون مورد</option>
        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <Button onClick={handleSave} className="w-full">{editProduct ? "تحديث" : "إضافة"}</Button>
    </div>
  );

  return (
    <DashboardLayout allowedRoles={["admin", "seller"]}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-inventory" />
            المخزون
          </h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportToExcel}>
              <Download className="w-4 h-4" /> تصدير Excel
            </Button>
            <Dialog open={isAddOpen} onOpenChange={o => { setIsAddOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4" /> إضافة منتج</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>إضافة منتج جديد</DialogTitle></DialogHeader>
                <ProductForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="ابحث..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
          </div>
          <select className="h-10 rounded-lg border bg-background px-3 text-sm" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="الكل">كل الأقسام</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-card rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-right font-medium">المنتج</th>
                <th className="p-3 text-right font-medium hidden sm:table-cell">القسم</th>
                <th className="p-3 text-right font-medium">السعر</th>
                <th className="p-3 text-right font-medium">المخزون</th>
                <th className="p-3 text-right font-medium hidden md:table-cell">SKU</th>
                <th className="p-3 text-center font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 hidden sm:table-cell text-muted-foreground">{p.category}</td>
                  <td className="p-3 tabular-nums">{p.price} د.ج</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.stock === 0 ? "bg-destructive/10 text-destructive" :
                      p.stock <= p.minStock ? "bg-warning/10 text-warning" :
                      "bg-profit/10 text-profit"
                    }`}>
                      {p.stock === 0 && <AlertTriangle className="w-3 h-3" />}
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground font-mono text-xs">{p.sku}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <Dialog open={editProduct?.id === p.id} onOpenChange={o => { if (!o) { setEditProduct(null); resetForm(); } }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>تعديل المنتج</DialogTitle></DialogHeader>
                          <ProductForm />
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { deleteProduct(p.id); toast.success("تم حذف المنتج"); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">لا توجد منتجات</p>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">لا توجد منتجات</p>
          ) : (
            filtered.map(p => {
              const supplierName = suppliers.find(s => s.id === p.supplier)?.name || "بدون مورد";
              return (
                <div key={p.id} className="bg-card rounded-xl border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category} · {supplierName}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Dialog
                        open={editProduct?.id === p.id}
                        onOpenChange={o => { if (!o) { setEditProduct(null); resetForm(); } }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>تعديل المنتج</DialogTitle></DialogHeader>
                          <ProductForm />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => { deleteProduct(p.id); toast.success("تم حذف المنتج"); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">السعر</p>
                      <p className="font-semibold tabular-nums">{p.price} د.ج</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">SKU</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.sku || "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">المخزون</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.stock === 0 ? "bg-destructive/10 text-destructive" :
                      p.stock <= p.minStock ? "bg-warning/10 text-warning" :
                      "bg-profit/10 text-profit"
                    }`}>
                      {p.stock === 0 && <AlertTriangle className="w-3 h-3" />}
                      {p.stock}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
