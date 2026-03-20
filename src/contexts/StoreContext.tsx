import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  Product, Supplier, Invoice, Sale,
  initialProducts, initialSuppliers, initialInvoices, initialSales,
} from "@/data/store-data";

type Theme = "light" | "dark";
type UserRole = "admin" | "seller";

type UserAccount = {
  id: string;
  username: string;
  password: string;
  role: UserRole;
};

type StoreSettings = {
  storeName: string;
  storePhone: string;
  storeAddress: string;
  theme: Theme;
  logoDataUrl?: string | null;
};

type StoreContextType = {
  products: Product[];
  suppliers: Supplier[];
  invoices: Invoice[];
  sales: Sale[];
  settings: StoreSettings;
  updateSettings: (s: StoreSettings) => void;
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addSupplier: (s: Omit<Supplier, "id">) => void;
  updateSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;
  addInvoice: (inv: Invoice, saleProfit: number) => void;
  deleteInvoice: (id: string) => void;
  nextInvoiceNumber: () => string;
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
  role: UserRole | null;
  users: UserAccount[];
  addUser: (u: Omit<UserAccount, "id">) => void;
  deleteUser: (id: string) => void;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
};

const StoreContext = createContext<StoreContextType | null>(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const LS_USERS_KEY = "store-insights.users.v1";
  const LS_SETTINGS_KEY = "store-insights.settings.v1";

  const loadUsers = (): UserAccount[] => {
    try {
      const raw = localStorage.getItem(LS_USERS_KEY);
      if (!raw) throw new Error("no-users");
      const parsed = JSON.parse(raw) as UserAccount[];
      if (!Array.isArray(parsed)) throw new Error("bad-users");
      return parsed.filter(u => typeof u?.username === "string" && typeof u?.password === "string" && (u?.role === "admin" || u?.role === "seller"));
    } catch {
      return [{ id: "u-admin", username: "admin", password: "admin123", role: "admin" }];
    }
  };

  const loadSettings = (): StoreSettings => {
    const base: StoreSettings = {
      storeName: "متجر التقنية",
      storePhone: "0555000000",
      storeAddress: "الجزائر العاصمة",
      theme: "light",
      logoDataUrl: null,
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
        logoDataUrl: typeof parsed.logoDataUrl === "string" || parsed.logoDataUrl === null ? parsed.logoDataUrl : base.logoDataUrl,
      };
    } catch {
      return base;
    }
  };

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [invoiceCounter, setInvoiceCounter] = useState(1001);
  const [users, setUsers] = useState<UserAccount[]>(loadUsers);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [settings, setSettings] = useState<StoreSettings>(() => loadSettings());

  const isAuthenticated = currentUser !== null;
  const role = currentUser?.role ?? null;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    try {
      localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore persistence errors (e.g. storage disabled)
    }
  }, [settings]);

  const updateSettings = useCallback((s: StoreSettings) => setSettings(s), []);

  const addUser = useCallback((u: Omit<UserAccount, "id">) => {
    setUsers(prev => {
      if (prev.some(x => x.username === u.username)) return prev;
      const next: UserAccount = { ...u, id: `u-${Date.now()}` };
      const updated = [...prev, next];
      try {
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => {
      const updated = prev.filter(x => x.id !== id);
      try {
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const login = useCallback((user: string, pass: string) => {
    const found = users.find(u => u.username === user && u.password === pass);
    if (!found) return false;
    setCurrentUser(found);
    return true;
  }, [users]);

  const logout = useCallback(() => setCurrentUser(null), []);

  const nextInvoiceNumber = useCallback(() => {
    const num = invoiceCounter;
    setInvoiceCounter(prev => prev + 1);
    return String(num).padStart(8, "0");
  }, [invoiceCounter]);

  const addProduct = useCallback((p: Omit<Product, "id">) => {
    setProducts(prev => [...prev, { ...p, id: `p${Date.now()}` }]);
  }, []);

  const updateProduct = useCallback((p: Product) => {
    setProducts(prev => prev.map(x => (x.id === p.id ? p : x)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(x => x.id !== id));
  }, []);

  const addSupplier = useCallback((s: Omit<Supplier, "id">) => {
    setSuppliers(prev => [...prev, { ...s, id: `s${Date.now()}` }]);
  }, []);

  const updateSupplier = useCallback((s: Supplier) => {
    setSuppliers(prev => prev.map(x => (x.id === s.id ? s : x)));
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    setSuppliers(prev => prev.filter(x => x.id !== id));
  }, []);

  const addInvoice = useCallback((inv: Invoice, saleProfit: number) => {
    setInvoices(prev => [...prev, inv]);
    setSales(prev => [
      ...prev,
      { id: `sale-${Date.now()}`, date: inv.date, invoiceId: inv.id, total: inv.total, profit: saleProfit, itemCount: inv.items.reduce((a, i) => a + i.quantity, 0) },
    ]);
    setProducts(prev =>
      prev.map(p => {
        const item = inv.items.find(i => i.productId === p.id);
        if (item) return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        return p;
      })
    );
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.filter(x => x.id !== id));
    setSales(prev => prev.filter(x => x.invoiceId !== id));
  }, []);

  return (
    <StoreContext.Provider value={{
      products, suppliers, invoices, sales, settings, updateSettings,
      addProduct, updateProduct, deleteProduct,
      addSupplier, updateSupplier, deleteSupplier,
      addInvoice, deleteInvoice, nextInvoiceNumber,
      isAuthenticated, currentUser, role, users, addUser, deleteUser,
      login, logout,
    }}>
      {children}
    </StoreContext.Provider>
  );
};
