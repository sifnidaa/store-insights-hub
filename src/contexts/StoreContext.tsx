import React, { createContext, useContext, useState, useCallback } from "react";
import {
  Product, Supplier, Invoice, Sale,
  initialProducts, initialSuppliers, initialInvoices, initialSales,
} from "@/data/store-data";

type StoreContextType = {
  products: Product[];
  suppliers: Supplier[];
  invoices: Invoice[];
  sales: Sale[];
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addInvoice: (inv: Invoice, saleProfit: number) => void;
  deleteInvoice: (id: string) => void;
  isAuthenticated: boolean;
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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [suppliers] = useState<Supplier[]>(initialSuppliers);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback((user: string, pass: string) => {
    if (user === "admin" && pass === "admin123") {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setIsAuthenticated(false), []);

  const addProduct = useCallback((p: Omit<Product, "id">) => {
    setProducts(prev => [...prev, { ...p, id: `p${Date.now()}` }]);
  }, []);

  const updateProduct = useCallback((p: Product) => {
    setProducts(prev => prev.map(x => (x.id === p.id ? p : x)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(x => x.id !== id));
  }, []);

  const addInvoice = useCallback((inv: Invoice, saleProfit: number) => {
    setInvoices(prev => [...prev, inv]);
    setSales(prev => [
      ...prev,
      { id: `sale-${Date.now()}`, date: inv.date, invoiceId: inv.id, total: inv.total, profit: saleProfit, itemCount: inv.items.reduce((a, i) => a + i.quantity, 0) },
    ]);
    // Reduce stock
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
      products, suppliers, invoices, sales,
      addProduct, updateProduct, deleteProduct,
      addInvoice, deleteInvoice,
      isAuthenticated, login, logout,
    }}>
      {children}
    </StoreContext.Provider>
  );
};
