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
import jsPDF from "jspdf";

const formatDate = (d: string) => new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

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

  const generatePDF = (inv: Invoice) => {
    const doc = new jsPDF({ putOnlyUsedFonts: true });
    
    // Use default font (Helvetica) - works without Arabic font
    doc.setFontSize(18);
    doc.text(settings.storeName, 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(settings.storePhone + " | " + settings.storeAddress, 105, 28, { align: "center" });
    
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(20, 33, 190, 33);
    
    doc.setFontSize(14);
    doc.text(`# ${inv.id}`, 190, 42, { align: "right" });
    doc.setFontSize(10);
    doc.text(formatDate(inv.date), 20, 42);
    
    let y = 55;
    if (inv.customerName) { doc.text(`Client: ${inv.customerName}`, 190, y, { align: "right" }); y += 7; }
    if (inv.customerPhone) { doc.text(`Phone: ${inv.customerPhone}`, 190, y, { align: "right" }); y += 7; }
    
    y += 5;
    // Table header
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, y, 170, 8, "F");
    doc.setFontSize(10);
    doc.text("Total", 30, y + 6);
    doc.text("Price", 65, y + 6);
    doc.text("Qty", 100, y + 6);
    doc.text("Product", 180, y + 6, { align: "right" });
    y += 8;
    
    doc.setTextColor(0, 0, 0);
    inv.items.forEach((item, i) => {
      const bg = i % 2 === 0 ? 245 : 255;
      doc.setFillColor(bg, bg, bg);
      doc.rect(20, y, 170, 8, "F");
      doc.text(`${(item.price * item.quantity).toLocaleString()} DZD`, 30, y + 6);
      doc.text(`${item.price.toLocaleString()} DZD`, 65, y + 6);
      doc.text(String(item.quantity), 105, y + 6);
      doc.text(item.productName, 180, y + 6, { align: "right" });
      y += 8;
    });
    
    y += 5;
    doc.setDrawColor(59, 130, 246);
    doc.line(20, y, 190, y);
    y += 8;
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text(`Total: ${inv.total.toLocaleString()} DZD`, 105, y, { align: "center" });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    y += 8;
    doc.text(`Payment: ${inv.paymentMethod}`, 105, y, { align: "center" });
    
    return doc;
  };

  const handleDownload = (inv: Invoice) => {
    const doc = generatePDF(inv);
    doc.save(`invoice-${inv.id}.pdf`);
    toast.success("تم تحميل الفاتورة PDF");
  };

  const handlePrint = (inv: Invoice) => {
    const doc = generatePDF(inv);
    doc.autoPrint();
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleWhatsApp = (inv: Invoice) => {
    let text = `فاتورة رقم: ${inv.id}\n`;
    text += `${settings.storeName}\n`;
    text += `التاريخ: ${formatDate(inv.date)}\n`;
    if (inv.customerName) text += `العميل: ${inv.customerName}\n`;
    text += `\nالمنتجات:\n`;
    inv.items.forEach(i => {
      text += `- ${i.productName} × ${i.quantity} = ${(i.price * i.quantity).toLocaleString()} د.ج\n`;
    });
    text += `\nالإجمالي: ${inv.total.toLocaleString()} د.ج\n`;
    text += `طريقة الدفع: ${inv.paymentMethod}`;
    const encoded = encodeURIComponent(text);
    const phone = inv.customerPhone ? inv.customerPhone.replace(/^0/, "213") : "";
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-revenue" />
          الفواتير
        </h1>

        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="ابحث بالرقم أو اسم العميل..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
        </div>

        <div className="bg-card rounded-xl border overflow-x-auto">
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
                  <td className="p-3 hidden sm:table-cell text-muted-foreground text-xs">{formatDate(inv.date)}</td>
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

        {/* View Invoice Dialog */}
        <Dialog open={!!viewInvoice} onOpenChange={o => { if (!o) setViewInvoice(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>فاتورة {viewInvoice?.id}</DialogTitle></DialogHeader>
            {viewInvoice && (
              <div className="space-y-3 text-sm">
                <p className="font-bold text-center text-primary">{settings.storeName}</p>
                <p><strong>التاريخ:</strong> {formatDate(viewInvoice.date)}</p>
                {viewInvoice.customerName && <p><strong>العميل:</strong> {viewInvoice.customerName}</p>}
                {viewInvoice.customerPhone && <p><strong>الهاتف:</strong> {viewInvoice.customerPhone}</p>}
                <div className="border rounded-lg overflow-hidden">
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
