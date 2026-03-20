export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  sku: string;
  supplier: string;
};

export type Supplier = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalPurchases: number;
};

export type Invoice = {
  id: string;
  date: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  total: number;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
};

export type Sale = {
  id: string;
  date: string;
  invoiceId: string;
  total: number;
  profit: number;
  itemCount: number;
};

export const categories = [
  "هواتف ذكية",
  "أغطية و حمايات",
  "شواحن و كوابل",
  "سماعات",
  "قطع غيار",
  "إكسسوارات",
  "خدمات إصلاح",
];

export const initialProducts: Product[] = [
  { id: "p1", name: "آيفون 15 برو ماكس", category: "هواتف ذكية", price: 5500, cost: 4800, stock: 5, minStock: 2, sku: "IP15PM", supplier: "s1" },
  { id: "p2", name: "سامسونج جالاكسي S24", category: "هواتف ذكية", price: 3800, cost: 3200, stock: 8, minStock: 3, sku: "SGS24", supplier: "s1" },
  { id: "p3", name: "غطاء سيليكون آيفون 15", category: "أغطية و حمايات", price: 80, cost: 25, stock: 50, minStock: 10, sku: "CSI15", supplier: "s2" },
  { id: "p4", name: "واقي شاشة زجاجي سامسونج", category: "أغطية و حمايات", price: 50, cost: 15, stock: 100, minStock: 20, sku: "SPG-S", supplier: "s2" },
  { id: "p5", name: "شاحن سريع 65 واط", category: "شواحن و كوابل", price: 150, cost: 70, stock: 30, minStock: 10, sku: "CHG65", supplier: "s3" },
  { id: "p6", name: "كابل تايب سي 2 متر", category: "شواحن و كوابل", price: 40, cost: 12, stock: 80, minStock: 20, sku: "CTPC2", supplier: "s3" },
  { id: "p7", name: "سماعات بلوتوث لاسلكية", category: "سماعات", price: 250, cost: 120, stock: 20, minStock: 5, sku: "BTEAR", supplier: "s3" },
  { id: "p8", name: "شاشة آيفون 14 أصلية", category: "قطع غيار", price: 800, cost: 500, stock: 10, minStock: 3, sku: "SCIP14", supplier: "s4" },
  { id: "p9", name: "بطارية سامسونج A54", category: "قطع غيار", price: 200, cost: 90, stock: 15, minStock: 5, sku: "BTSA54", supplier: "s4" },
  { id: "p10", name: "حامل هاتف للسيارة", category: "إكسسوارات", price: 60, cost: 20, stock: 40, minStock: 10, sku: "CRHLD", supplier: "s2" },
  { id: "p11", name: "إصلاح شاشة", category: "خدمات إصلاح", price: 300, cost: 100, stock: 999, minStock: 0, sku: "RPR-SC", supplier: "s4" },
  { id: "p12", name: "إصلاح بطارية", category: "خدمات إصلاح", price: 150, cost: 50, stock: 999, minStock: 0, sku: "RPR-BT", supplier: "s4" },
];

export const initialSuppliers: Supplier[] = [
  { id: "s1", name: "شركة الهواتف المتحدة", phone: "0555123456", email: "info@unitedphones.com", address: "الرياض - شارع العليا", totalPurchases: 45000 },
  { id: "s2", name: "مؤسسة الإكسسوارات الذكية", phone: "0555789012", email: "smart@accessories.com", address: "جدة - شارع التحلية", totalPurchases: 12000 },
  { id: "s3", name: "توريدات التقنية", phone: "0555345678", email: "tech@supplies.com", address: "الدمام - المنطقة الصناعية", totalPurchases: 28000 },
  { id: "s4", name: "قطع الغيار الأصلية", phone: "0555901234", email: "parts@original.com", address: "الرياض - طريق الملك فهد", totalPurchases: 35000 },
];

export const initialInvoices: Invoice[] = [
  {
    id: "inv-001",
    date: new Date().toISOString(),
    items: [
      { productId: "p3", productName: "غطاء سيليكون آيفون 15", quantity: 2, price: 80 },
      { productId: "p5", productName: "شاحن سريع 65 واط", quantity: 1, price: 150 },
    ],
    total: 310,
    paymentMethod: "نقدي",
    customerName: "أحمد محمد",
    customerPhone: "0551234567",
  },
  {
    id: "inv-002",
    date: new Date(Date.now() - 86400000).toISOString(),
    items: [
      { productId: "p1", productName: "آيفون 15 برو ماكس", quantity: 1, price: 5500 },
    ],
    total: 5500,
    paymentMethod: "بطاقة",
    customerName: "سارة علي",
    customerPhone: "0559876543",
  },
];

export const initialSales: Sale[] = [
  { id: "sale-001", date: new Date().toISOString(), invoiceId: "inv-001", total: 310, profit: 183, itemCount: 3 },
  { id: "sale-002", date: new Date(Date.now() - 86400000).toISOString(), invoiceId: "inv-002", total: 5500, profit: 700, itemCount: 1 },
];
