import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useStore } from "@/contexts/StoreContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Download, Printer, Share2, Trash2, Eye } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Invoice } from "@/data/store-data";
import {
  downloadInvoicePDF,
  formatInvoiceDate,
  printInvoicePDF,
  shareInvoiceWhatsApp,
} from "@/lib/invoicePdf";

const Invoices = () => {
  const { invoices, deleteInvoice, settings } = useStore();
  const [search, setSearch] = useState("");
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const filtered = useMemo(() =>
    invoices.filter(inv =>
      inv.id.includes(search) ||
      inv.customerName?.includes(search) ||
      inv.items.some(i => i.productName.includes(search))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [invoices, search]);

  const handleDownload = (inv: Invoice) => {
    downloadInvoicePDF(inv, settings);
    toast.success("تم تحميل الفاتورة PDF");
  };

  const handlePrint = (inv: Invoice) => {
    printInvoicePDF(inv, settings);
  };

  const handleWhatsApp = (inv: Invoice) => {
    shareInvoiceWhatsApp(inv, settings);
  };

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-revenue" />
          الفواتير
        </h1>

        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="ابحث بالرقم أو اسم العميل..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-card rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-right font-medium">رقم الفاتورة</th>
                <th className="p-3 text-right font-medium hidden sm:table-cell">التاريخ</th>
                <th className="p-3 text-right font-medium hidden md:table-cell">العميل</th>
                <th className="p-3 text-right font-medium">الإجمالي</th>
                <th className="p-3 text-right font-medium hidden sm:table-cell">الدفع</th>
                <th className="p-3 text-center font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs">{inv.id}</td>
                  <td className="p-3 hidden sm:table-cell text-muted-foreground text-xs">{formatInvoiceDate(inv.date)}</td>
                  <td className="p-3 hidden md:table-cell">{inv.customerName || "—"}</td>
                  <td className="p-3 font-bold tabular-nums">{inv.total.toLocaleString()} د.ج</td>
                  <td className="p-3 hidden sm:table-cell">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">{inv.paymentMethod}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-0.5 flex-wrap">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewInvoice(inv)} title="عرض">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(inv)} title="تحميل PDF">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePrint(inv)} title="طباعة">
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-profit" onClick={() => handleWhatsApp(inv)} title="واتساب">
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { deleteInvoice(inv.id); toast.success("تم حذف الفاتورة"); }} title="حذف">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">لا توجد فواتير</p>}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">لا توجد فواتير</p>
          ) : (
            filtered.map(inv => (
              <div key={inv.id} className="bg-card rounded-xl border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold truncate text-sm">فاتورة {inv.id}</p>
                    <p className="text-xs text-muted-foreground">{formatInvoiceDate(inv.date)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      العميل: {inv.customerName || "—"}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">الإجمالي</p>
                    <p className="font-bold tabular-nums">{inv.total.toLocaleString()} د.ج</p>
                    <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                      {inv.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-start gap-2 flex-wrap">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewInvoice(inv)} title="عرض">
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(inv)} title="تحميل PDF">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePrint(inv)} title="طباعة">
                    <Printer className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-profit" onClick={() => handleWhatsApp(inv)} title="واتساب">
                    <Share2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { deleteInvoice(inv.id); toast.success("تم حذف الفاتورة"); }} title="حذف">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View Invoice Dialog */}
        <Dialog open={!!viewInvoice} onOpenChange={o => { if (!o) setViewInvoice(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>فاتورة {viewInvoice?.id}</DialogTitle></DialogHeader>
            {viewInvoice && (
              <div className="space-y-3 text-sm">
                <p className="font-bold text-center text-primary">{settings.storeName}</p>
                <p><strong>التاريخ:</strong> {formatInvoiceDate(viewInvoice.date)}</p>
                {viewInvoice.customerName && <p><strong>العميل:</strong> {viewInvoice.customerName}</p>}
                {viewInvoice.customerPhone && <p><strong>الهاتف:</strong> {viewInvoice.customerPhone}</p>}
                <div className="border rounded-lg overflow-hidden">
                  {/* Desktop table */}
                  <div className="hidden sm:block">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-muted/50 border-b"><th className="p-2 text-right">المنتج</th><th className="p-2 text-right">الكمية</th><th className="p-2 text-right">السعر</th><th className="p-2 text-right">المجموع</th></tr></thead>
                      <tbody>
                        {viewInvoice.items.map((item, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="p-2">{item.productName}</td>
                            <td className="p-2 tabular-nums">{item.quantity}</td>
                            <td className="p-2 tabular-nums">{item.price}</td>
                            <td className="p-2 tabular-nums font-medium">{(item.price * item.quantity).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="sm:hidden divide-y">
                    {viewInvoice.items.map((item, i) => (
                      <div key={i} className="p-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{item.productName}</p>
                          <p className="text-xs text-muted-foreground tabular-nums mt-1">
                            الكمية: {item.quantity} · السعر: {item.price}
                          </p>
                        </div>
                        <p className="text-xs font-medium tabular-nums">{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>الإجمالي</span>
                  <span className="text-primary">{viewInvoice.total.toLocaleString()} د.ج</span>
                </div>
                <p><strong>طريقة الدفع:</strong> {viewInvoice.paymentMethod}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
