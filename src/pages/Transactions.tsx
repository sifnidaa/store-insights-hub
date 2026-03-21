import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useStore } from "@/contexts/StoreContext";
import { Receipt, Calendar, DollarSign, TrendingUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Transactions = () => {
  const { sales, invoices } = useStore();
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("today");
  const [search, setSearch] = useState("");

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const d = new Date(s.date);
      if (filter === "today") return d >= startOfDay;
      if (filter === "week") return d >= startOfWeek;
      if (filter === "month") return d >= startOfMonth;
      return true;
    }).filter(s => {
      if (!search) return true;
      const inv = invoices.find(i => i.id === s.invoiceId);
      return s.invoiceId.includes(search) || inv?.customerName?.includes(search) || false;
    });
  }, [sales, invoices, filter, search, startOfDay, startOfWeek, startOfMonth]);

  const totalRevenue = filteredSales.reduce((a, s) => a + s.total, 0);
  const totalProfit = filteredSales.reduce((a, s) => a + s.profit, 0);
  const totalItems = filteredSales.reduce((a, s) => a + s.itemCount, 0);

  const filterLabels = { all: "الكل", today: "اليوم", week: "هذا الأسبوع", month: "هذا الشهر" };

  return (
    <DashboardLayout allowedRoles={["admin", "seller"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="w-6 h-6 text-primary" />
          سجل المعاملات
        </h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card rounded-xl border p-4 text-center">
            <p className="text-xs text-muted-foreground">عدد العمليات</p>
            <p className="text-2xl font-bold text-primary tabular-nums">{filteredSales.length}</p>
          </div>
          <div className="bg-card rounded-xl border p-4 text-center">
            <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
            <p className="text-2xl font-bold text-revenue tabular-nums">{totalRevenue.toLocaleString()} <span className="text-xs">د.ج</span></p>
          </div>
          <div className="bg-card rounded-xl border p-4 text-center">
            <p className="text-xs text-muted-foreground">إجمالي الأرباح</p>
            <p className="text-2xl font-bold text-profit tabular-nums">{totalProfit.toLocaleString()} <span className="text-xs">د.ج</span></p>
          </div>
          <div className="bg-card rounded-xl border p-4 text-center">
            <p className="text-xs text-muted-foreground">إجمالي المنتجات المباعة</p>
            <p className="text-2xl font-bold tabular-nums">{totalItems}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            {(Object.keys(filterLabels) as Array<keyof typeof filterLabels>).map(k => (
              <Button key={k} variant={filter === k ? "default" : "outline"} size="sm" onClick={() => setFilter(k)} className="text-xs">
                {filterLabels[k]}
              </Button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="ابحث برقم الفاتورة أو اسم العميل..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
          </div>
        </div>

        {/* Transactions table */}
        <div className="bg-card rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-right font-medium">رقم الفاتورة</th>
                <th className="p-3 text-right font-medium">التاريخ</th>
                <th className="p-3 text-right font-medium hidden sm:table-cell">العميل</th>
                <th className="p-3 text-right font-medium">المبلغ</th>
                <th className="p-3 text-right font-medium hidden md:table-cell">الربح</th>
                <th className="p-3 text-right font-medium hidden md:table-cell">المنتجات</th>
                <th className="p-3 text-right font-medium hidden sm:table-cell">الدفع</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(s => {
                const inv = invoices.find(i => i.id === s.invoiceId);
                return (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs font-bold">{s.invoiceId}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(s.date).toLocaleDateString("ar-DZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="p-3 hidden sm:table-cell">{inv?.customerName || "—"}</td>
                    <td className="p-3 font-bold tabular-nums text-revenue">{s.total.toLocaleString()} د.ج</td>
                    <td className="p-3 hidden md:table-cell tabular-nums text-profit">{s.profit.toLocaleString()} د.ج</td>
                    <td className="p-3 hidden md:table-cell tabular-nums">{s.itemCount}</td>
                    <td className="p-3 hidden sm:table-cell">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">{inv?.paymentMethod || "—"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">لا توجد معاملات في هذه الفترة</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
