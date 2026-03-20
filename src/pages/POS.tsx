import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useStore } from "@/contexts/StoreContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories, Product, type Invoice } from "@/data/store-data";
import { Search, Plus, Minus, Trash2, ShoppingCart, Check, Download, Printer, Share2 } from "lucide-react";
import { toast } from "sonner";
import Calculator from "@/components/Calculator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { downloadInvoicePDF, formatInvoiceDate, printInvoicePDF, shareInvoiceWhatsApp } from "@/lib/invoicePdf";

type CartItem = { product: Product; quantity: number };

const POS = () => {
  const { products, addInvoice, nextInvoiceNumber, settings } = useStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("نقدي");
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "الكل" || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error("لا يوجد مخزون كافي");
          return prev;
        }
        return prev.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      if (product.stock <= 0) {
        toast.error("المنتج غير متوفر");
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.product.id !== productId) return c;
      const newQty = c.quantity + delta;
      if (newQty <= 0) return c;
      if (newQty > c.product.stock) { toast.error("لا يوجد مخزون كافي"); return c; }
      return { ...c, quantity: newQty };
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(c => c.product.id !== productId));
  };

  const total = cart.reduce((a, c) => a + c.product.price * c.quantity, 0);
  const totalProfit = cart.reduce((a, c) => a + (c.product.price - c.product.cost) * c.quantity, 0);

  const checkout = () => {
    if (cart.length === 0) { toast.error("السلة فارغة"); return; }
    const invNumber = nextInvoiceNumber();
    const inv = {
      id: invNumber,
      date: new Date().toISOString(),
      items: cart.map(c => ({ productId: c.product.id, productName: c.product.name, quantity: c.quantity, price: c.product.price })),
      total,
      paymentMethod,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
    };
    addInvoice(inv, totalProfit);
    setReceiptInvoice(inv);
    setIsReceiptOpen(true);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    toast.success(`تمت عملية البيع بنجاح - فاتورة رقم ${invNumber}`);
  };

  const receiptActions = {
    download: () => {
      if (!receiptInvoice) return;
      downloadInvoicePDF(receiptInvoice, settings);
      toast.success("تم تحميل فاتورة PDF");
    },
    print: () => {
      if (!receiptInvoice) return;
      printInvoicePDF(receiptInvoice, settings);
    },
    whatsapp: () => {
      if (!receiptInvoice) return;
      shareInvoiceWhatsApp(receiptInvoice, settings);
    },
  };

  return (
    <DashboardLayout allowedRoles={["admin", "seller"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">نقطة البيع</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Products */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="ابحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {["الكل", ...categories].map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="whitespace-nowrap text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="bg-card rounded-xl p-3 text-right border hover:border-primary hover:shadow-md transition-all active:scale-[0.97] space-y-1"
                >
                  <p className="font-medium text-sm leading-tight line-clamp-2">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">المخزون: {p.stock}</span>
                    <span className="font-bold text-primary text-sm">{p.price} د.ج</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="bg-card rounded-xl border p-4 space-y-3 h-fit lg:sticky lg:top-20">
            <h2 className="font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              السلة ({cart.length})
            </h2>

            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">السلة فارغة</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cart.map(c => (
                  <div key={c.product.id} className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.product.price} د.ج (للوحدة)
                      </p>
                      <p className="text-xs text-primary tabular-nums">
                        المجموع: {(c.product.price * c.quantity).toLocaleString()} د.ج
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(c.product.id, -1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium tabular-nums">{c.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(c.product.id, 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(c.product.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 border-t pt-3">
              <Input placeholder="اسم العميل (اختياري)" value={customerName} onChange={e => setCustomerName(e.target.value)} className="text-sm" />
              <Input placeholder="رقم الهاتف (اختياري)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="text-sm" />
              <div className="flex gap-2">
                {["نقدي", "بطاقة", "تحويل"].map(m => (
                  <Button key={m} variant={paymentMethod === m ? "default" : "outline"} size="sm" onClick={() => setPaymentMethod(m)} className="flex-1 text-xs">
                    {m}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between font-bold text-lg">
                <span>الإجمالي</span>
                <span className="text-primary tabular-nums">{total.toLocaleString()} د.ج</span>
              </div>
              <Button onClick={checkout} className="w-full h-11 active:scale-[0.97] transition-transform" disabled={cart.length === 0}>
                <Check className="w-4 h-4" />
                إتمام البيع
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Calculator />

      {/* Receipt Dialog */}
      <Dialog
        open={isReceiptOpen}
        onOpenChange={(o) => {
          setIsReceiptOpen(o);
          if (!o) setReceiptInvoice(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>فاتورة {receiptInvoice?.id}</DialogTitle>
          </DialogHeader>

          {receiptInvoice && (
            <div className="space-y-3 text-sm">
              <p className="font-bold text-center text-primary">{settings.storeName}</p>
              <p className="text-center text-xs text-muted-foreground">
                {formatInvoiceDate(receiptInvoice.date)}
              </p>

              {receiptInvoice.customerName && (
                <p><strong>العميل:</strong> {receiptInvoice.customerName}</p>
              )}
              {receiptInvoice.customerPhone && (
                <p><strong>الهاتف:</strong> {receiptInvoice.customerPhone}</p>
              )}

              <div className="border rounded-lg overflow-hidden">
                <div className="p-2 bg-muted/50 text-xs font-medium flex items-center justify-between">
                  <span>المنتج</span>
                  <span>المجموع</span>
                </div>
                <div className="divide-y">
                  {receiptInvoice.items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className="p-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {item.quantity} × {item.price} د.ج
                        </p>
                      </div>
                      <p className="text-xs font-medium tabular-nums">
                        {(item.price * item.quantity).toLocaleString()} د.ج
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>الإجمالي</span>
                <span className="text-primary tabular-nums">{receiptInvoice.total.toLocaleString()} د.ج</span>
              </div>

              <p><strong>طريقة الدفع:</strong> {receiptInvoice.paymentMethod}</p>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={receiptActions.download}>
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button variant="outline" className="flex-1" onClick={receiptActions.print}>
                  <Printer className="w-4 h-4" />
                  طباعة
                </Button>
              </div>
              <Button className="w-full" onClick={receiptActions.whatsapp} variant="default">
                <Share2 className="w-4 h-4" />
                واتساب
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default POS;
