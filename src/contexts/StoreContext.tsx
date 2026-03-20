import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  Product, Supplier, Invoice, Sale,
  initialProducts, initialSuppliers, initialInvoices, initialSales,
} from "@/data/store-data";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

type Theme = "light" | "dark";
import { UserRole, UserAccount } from "./AuthContext";

type StoreSettings = {
  storeName: string;
  storePhone: string;
  storeAddress: string;
  theme: Theme;
  logoUrl?: string | null;
};

const SINGLETON_SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

type StoreContextType = {
  invoices: Invoice[];
  sales: Sale[];
  settings: StoreSettings;
  isLoadingSettings: boolean;
  updateSettings: (s: StoreSettings) => Promise<boolean>;
  products: Product[];
  suppliers: Supplier[];
  isLoadingProducts: boolean;
  isLoadingSuppliers: boolean;
  addProduct: (p: Omit<Product, "id">) => Promise<boolean>;
  updateProduct: (p: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  addSupplier: (s: Omit<Supplier, "id">) => Promise<boolean>;
  updateSupplier: (s: Supplier) => Promise<boolean>;
  deleteSupplier: (id: string) => Promise<boolean>;
  addInvoice: (inv: Invoice, saleProfit: number) => Promise<boolean>;
  deleteInvoice: (id: string) => Promise<boolean>;
  nextInvoiceNumber: () => Promise<string>;
};

const StoreContext = createContext<StoreContextType | null>(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const LS_SETTINGS_KEY = "store-insights.settings.v1";

  const loadSettings = (): StoreSettings => {
    const base: StoreSettings = {
      storeName: "متجر التقنية",
      storePhone: "0555000000",
      storeAddress: "الجزائر العاصمة",
      theme: "light",
      logoUrl: null,
    };
    try {
      const raw = localStorage.getItem(LS_SETTINGS_KEY);
      if (!raw) return base;
      const parsed = JSON.parse(raw) as Partial<StoreSettings>;
      return {
        ...base,
        storeName: typeof parsed.storeName === "string" ? parsed.storeName : base.storeName,
        storePhone: typeof parsed.storePhone === "string" ? parsed.storePhone : base.storePhone,
        storeAddress: typeof parsed.storeAddress === "string" ? parsed.storeAddress : base.storeAddress,
        theme: parsed.theme === "dark" ? "dark" : "light",
        logoUrl: typeof parsed.logoUrl === "string" || parsed.logoUrl === null ? parsed.logoUrl : base.logoUrl,
      };
    } catch {
      return base;
    }
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(() => loadSettings());
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);

  // Handle auth state changes and initial load
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoadingSettings(true);
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', SINGLETON_SETTINGS_ID)
        .single();
      
      if (data && !error) {
        setSettings({
          storeName: data.store_name,
          storePhone: data.store_phone || "",
          storeAddress: data.store_address || "",
          theme: (data.theme as Theme) || "light",
          logoUrl: data.logo_url,
        });
      }
      setIsLoadingSettings(false);
    };

    const fetchSuppliers = async () => {
      setIsLoadingSuppliers(true);
      const { data, error } = await supabase.from('suppliers').select('*').order('name');
      if (data && !error) {
        setSuppliers(data.map(s => ({
          id: s.id,
          name: s.name,
          phone: s.phone || "",
          email: s.email || "",
          address: s.address || "",
          totalPurchases: Number(s.total_purchases) || 0,
        })));
      }
      setIsLoadingSuppliers(false);
    };

    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (data && !error) {
        setProducts(data.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category || "",
          price: Number(p.price) || 0,
          cost: Number(p.cost) || 0,
          stock: p.stock || 0,
          minStock: p.min_stock || 0,
          sku: p.sku || "",
          supplier: p.supplier_id || "",
        })));
      }
      setIsLoadingProducts(false);
    };

    const fetchInvoices = async () => {
      const { data, error } = await supabase.from('invoices').select(`
        *,
        items:invoice_items(*)
      `).order('created_at', { ascending: false });
      
      if (data && !error) {
        setInvoices(data.map(inv => ({
          id: inv.id,
          date: inv.created_at,
          total: Number(inv.total),
          paymentMethod: inv.payment_method,
          customerName: inv.customer_name || undefined,
          customerPhone: inv.customer_phone || undefined,
          items: inv.items.map((i: any) => ({
            productId: i.product_id,
            productName: i.product_name,
            quantity: i.quantity,
            price: Number(i.price),
          })),
        })));
      }
    };

    const fetchSales = async () => {
      const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        setSales(data.map(s => ({
          id: s.id,
          date: s.created_at,
          invoiceId: s.invoice_id,
          total: Number(s.total),
          profit: Number(s.profit),
          itemCount: s.item_count,
        })));
      }
    };

    fetchSettings();
    fetchSuppliers();
    fetchProducts();
    fetchInvoices();
    fetchSales();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    try {
      localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore persistence errors (e.g. storage disabled)
    }
  }, [settings]);

  const updateSettings = useCallback(async (s: StoreSettings) => {
    const { error } = await supabase
      .from('store_settings')
      .update({
        store_name: s.storeName,
        store_phone: s.storePhone,
        store_address: s.storeAddress,
        theme: s.theme,
        logo_url: s.logoUrl,
      })
      .eq('id', SINGLETON_SETTINGS_ID);

    if (error) {
      console.error('Error updating settings:', error);
      return false;
    }
    setSettings(s);
    return true;
  }, []);


  const nextInvoiceNumber = useCallback(async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    if (error || !data || data.length === 0) return "00001001";
    const lastId = parseInt(data[0].id);
    return String(lastId + 1).padStart(8, "0");
  }, []);

  const addProduct = useCallback(async (p: Omit<Product, "id">) => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: p.name,
        category: p.category,
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        min_stock: p.minStock,
        sku: p.sku,
        supplier_id: p.supplier || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      return false;
    }
    
    setProducts(prev => [...prev, { ...p, id: data.id }]);
    return true;
  }, []);

  const updateProduct = useCallback(async (p: Product) => {
    const { error } = await supabase
      .from('products')
      .update({
        name: p.name,
        category: p.category,
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        min_stock: p.minStock,
        sku: p.sku,
        supplier_id: p.supplier || null,
      })
      .eq('id', p.id);

    if (error) {
      console.error('Error updating product:', error);
      return false;
    }

    setProducts(prev => prev.map(x => (x.id === p.id ? p : x)));
    return true;
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }
    setProducts(prev => prev.filter(x => x.id !== id));
    return true;
  }, []);

  const addSupplier = useCallback(async (s: Omit<Supplier, "id">) => {
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        name: s.name,
        phone: s.phone,
        email: s.email,
        address: s.address,
        total_purchases: s.totalPurchases,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding supplier:', error);
      return false;
    }
    
    setSuppliers(prev => [...prev, { ...s, id: data.id }]);
    return true;
  }, []);

  const updateSupplier = useCallback(async (s: Supplier) => {
    const { error } = await supabase
      .from('suppliers')
      .update({
        name: s.name,
        phone: s.phone,
        email: s.email,
        address: s.address,
        total_purchases: s.totalPurchases,
      })
      .eq('id', s.id);

    if (error) {
      console.error('Error updating supplier:', error);
      return false;
    }

    setSuppliers(prev => prev.map(x => (x.id === s.id ? s : x)));
    return true;
  }, []);

  const deleteSupplier = useCallback(async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) {
      console.error('Error deleting supplier:', error);
      return false;
    }
    setSuppliers(prev => prev.filter(x => x.id !== id));
    return true;
  }, []);

  const addInvoice = useCallback(async (inv: Invoice, saleProfit: number) => {
    // 1. Insert Invoice
    const { error: invErr } = await supabase.from('invoices').insert({
      id: inv.id,
      created_at: inv.date,
      total: inv.total,
      payment_method: inv.paymentMethod,
      customer_name: inv.customerName,
      customer_phone: inv.customerPhone,
    });
    if (invErr) { console.error("Invoice insert error:", invErr); return false; }

    // 2. Insert Items
    const { error: itemsErr } = await supabase.from('invoice_items').insert(
      inv.items.map(item => ({
        invoice_id: inv.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
      }))
    );
    if (itemsErr) { console.error("Items insert error:", itemsErr); return false; }

    // 3. Insert Sale
    const itemCount = inv.items.reduce((a, i) => a + i.quantity, 0);
    const { data: saleData, error: saleErr } = await supabase.from('sales').insert({
      invoice_id: inv.id,
      created_at: inv.date,
      total: inv.total,
      profit: saleProfit,
      item_count: itemCount,
    }).select().single();
    if (saleErr) { console.error("Sale insert error:", saleErr); return false; }

    // 4. Update Stock & Local State
    for (const item of inv.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        await supabase.from('products').update({
          stock: Math.max(0, product.stock - item.quantity)
        }).eq('id', product.id);
      }
    }

    setInvoices(prev => [inv, ...prev]);
    if (saleData) {
      setSales(prev => [{
        id: saleData.id,
        date: saleData.created_at,
        invoiceId: inv.id,
        total: inv.total,
        profit: saleProfit,
        itemCount: itemCount,
      }, ...prev]);
    }

    // Refresh products to get updated stock
    const { data: updatedProducts } = await supabase.from('products').select('*').order('name');
    if (updatedProducts) {
      setProducts(updatedProducts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category || "",
        price: Number(p.price) || 0,
        cost: Number(p.cost) || 0,
        stock: p.stock || 0,
        minStock: p.min_stock || 0,
        sku: p.sku || "",
        supplier: p.supplier_id || "",
      })));
    }

    return true;
  }, [products]);

  const deleteInvoice = useCallback(async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) { console.error("Delete invoice error:", error); return false; }
    
    setInvoices(prev => prev.filter(x => x.id !== id));
    setSales(prev => prev.filter(x => x.invoiceId !== id));
    return true;
  }, []);

  return (
    <StoreContext.Provider value={{
      products, suppliers, invoices, sales, settings, isLoadingSettings, isLoadingProducts, isLoadingSuppliers, updateSettings,
      addProduct, updateProduct, deleteProduct,
      addSupplier, updateSupplier, deleteSupplier,
      addInvoice, deleteInvoice, nextInvoiceNumber,
    }}>
      {children}
    </StoreContext.Provider>
  );
};
