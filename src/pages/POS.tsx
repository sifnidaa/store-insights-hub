import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useStore } from "@/contexts/StoreContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories, Product, type Invoice } from "@/data/store-data";
import { Search, Plus, Minus, Trash2, ShoppingCart, Check, Download, Printer, Share2, Percent, Tag } from "lucide-react";
import { toast } from "sonner";
import Calculator from "@/components/Calculator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { downloadInvoicePDF, formatInvoiceDate, printInvoicePDF, shareInvoiceWhatsApp } from "@/lib/invoicePdf";

type CartItem = {
  product: Product;
  quantity: number;
  customPrice: number | null; // null = use product price
  discountType: "none" | "fixed" | "percent";
  discountValue: number;
};

const POS = () => {
  const { products, addInvoice, nextInvoiceNumber, settings, isLoadingProducts } = useStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("نقدي");
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Merge categories from products
  const allCategories = useMemo(() => {
    const fromProducts = products.map(p => p.category).filter(Boolean);
    return [...new Set([...categories, ...fromProducts])];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "الكل" || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCategory]);

  const getItemPrice = (item: CartItem) => {
    const basePrice = item.customPrice !== null ? item.customPrice : item.product.price;
    if (item.discountType === "fixed") return Math.max(0, basePrice - item.discountValue);
    if (item.discountType === "percent") return Math.max(0, basePrice * (1 - item.discountValue / 100));
    return basePrice;
  };

  const getItemTotal = (item: CartItem) => getItemPrice(item) * item.quantity;

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
      return [...prev, { product, quantity: 1, customPrice: null, discountType: "none", discountValue: 0 }];
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

  const updateCartItem = (productId: string, updates: Partial<CartItem>) => {
    setCart(prev => prev.map(c => c.product.id === productId ? { ...c, ...updates } : c));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(c => c.product.id !== productId));
  };

  const total = cart.reduce((a, c) => a + getItemTotal(c), 0);
  const totalProfit = cart.reduce((a, c) => a + (getItemPrice(c) - c.product.cost) * c.quantity, 0);

  const checkout = async () => {
    if (cart.length === 0) { toast.error("السلة فارغة"); return; }
    setIsCheckingOut(true);
    try {
      const invNumber = await nextInvoiceNumber();
      const inv: Invoice = {
        id: invNumber,
        date: new Date().toISOString(),
        items: cart.map(c => ({
          productId: c.product.id,
          productName: c.product.name,
          quantity: c.quantity,
          price: getItemPrice(c),
        })),
        total,
        paymentMethod,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
      };
      const success = await addInvoice(inv, totalProfit);
      if (success) {
        setReceiptInvoice(inv);
        setIsReceiptOpen(true);
        setCart([]);
        setCustomerName("");
        setCustomerPhone("");
        toast.success(`تمت عملية البيع بنجاح - فاتورة رقم ${invNumber}`);
      } else {
        toast.error("فشل إتمام عملية البيع");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const receiptActions = {
    download: () => { if (receiptInvoice) { downloadInvoicePDF(receiptInvoice, settings); toast.success("تم تحميل فاتورة PDF"); } },
    print: () => { if (receiptInvoice) printInvoicePDF(receiptInvoice, settings); },
    whatsapp: () => { if (receiptInvoice) shareInvoiceWhatsApp(receiptInvoice, settings); },
  };

  return (
    <DashboardLayout allowedRoles={["admin", "seller"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" />
          نقطة البيع
        </h1>

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
              {["الكل", ...allCategories].map(cat => (
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

            {isLoadingProducts ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filtered.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    disabled={p.stock <= 0}
                    className="bg-card rounded-xl p-3 text-right border hover:border-primary hover:shadow-md transition-all active:scale-[0.97] space-y-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <p className="font-medium text-sm leading-tight line-clamp-2">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${p.stock <= p.minStock ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                        المخزون: {p.stock}
                      </span>
                      <span className="font-bold text-primary text-sm">{p.price.toLocaleString()} د.ج</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-card rounded-xl border p-4 space-y-3 h-fit lg:sticky lg:top-20">
            <h2 className="font-bold flex items-center gap-2 text-lg">
              <ShoppingCart className="w-5 h-5 text-primary" />
              السلة ({cart.length})
            </h2>

            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">السلة فارغة</p>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {cart.map(c => (
                  <div key={c.product.id} className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate">{c.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          السعر الأصلي: {c.product.price.toLocaleString()} د.ج
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => removeFromCart(c.product.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-12">الكمية:</span>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(c.product.id, -1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-bold tabular-nums">{c.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(c.product.id, 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Custom price */}
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <Input
                        type="number"
                        placeholder="سعر مخصص"
                        className="h-7 text-xs flex-1"
                        value={c.customPrice ?? ""}
                        onChange={e => updateCartItem(c.product.id, { customPrice: e.target.value ? +e.target.value : null })}
                      />
                    </div>

                    {/* Discount */}
                    <div className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <select
                        className="h-7 rounded border bg-background px-1.5 text-xs"
                        value={c.discountType}
                        onChange={e => updateCartItem(c.product.id, { discountType: e.target.value as CartItem["discountType"], discountValue: 0 })}
                      >
                        <option value="none">بدون خصم</option>
                        <option value="fixed">مبلغ ثابت</option>
                        <option value="percent">نسبة مئوية</option>
                      </select>
                      {c.discountType !== "none" && (
                        <Input
                          type="number"
                          placeholder={c.discountType === "percent" ? "%" : "د.ج"}
                          className="h-7 text-xs flex-1"
                          value={c.discountValue || ""}
                          onChange={e => updateCartItem(c.product.id, { discountValue: +e.target.value })}
                        />
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">السعر النهائي:</span>
                      <span className="text-sm font-bold text-primary tabular-nums">
                        {getItemTotal(c).toLocaleString()} د.ج
                      </span>
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
              <Button onClick={checkout} className="w-full h-11 active:scale-[0.97] transition-transform text-base font-bold" disabled={cart.length === 0 || isCheckingOut}>
                {isCheckingOut ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : <Check className="w-5 h-5" />}
                إتمام البيع
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Calculator />

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={o => { setIsReceiptOpen(o); if (!o) setReceiptInvoice(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>فاتورة {receiptInvoice?.id}</DialogTitle>
          </DialogHeader>
          {receiptInvoice && (
            <div className="space-y-3 text-sm">
              <p className="font-bold text-center text-primary text-lg">{settings.storeName}</p>
              <p className="text-center text-xs text-muted-foreground">{formatInvoiceDate(receiptInvoice.date)}</p>
              {receiptInvoice.customerName && <p><strong>العميل:</strong> {receiptInvoice.customerName}</p>}
              {receiptInvoice.customerPhone && <p><strong>الهاتف:</strong> {receiptInvoice.customerPhone}</p>}
              <div className="border rounded-lg overflow-hidden">
                <div className="p-2 bg-muted/50 text-xs font-medium flex items-center justify-between">
                  <span>المنتج</span><span>المجموع</span>
                </div>
                <div className="divide-y">
                  {receiptInvoice.items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className="p-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">{item.quantity} × {item.price.toLocaleString()} د.ج</p>
                      </div>
                      <p className="text-xs font-medium tabular-nums">{(item.price * item.quantity).toLocaleString()} د.ج</p>
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
                <Button variant="outline" className="flex-1" onClick={receiptActions.download}><Download className="w-4 h-4" /> PDF</Button>
                <Button variant="outline" className="flex-1" onClick={receiptActions.print}><Printer className="w-4 h-4" /> طباعة</Button>
              </div>
              <Button className="w-full" onClick={receiptActions.whatsapp} variant="default"><Share2 className="w-4 h-4" /> واتساب</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default POS;
