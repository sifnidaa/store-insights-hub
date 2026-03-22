import { useState, useMemo } from "react";
import { useStore } from "@/contexts/StoreContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import {
  DollarSign, Package, TrendingUp, ShoppingCart, AlertTriangle,
  Users, FileText, Wrench, Clock, BarChart3, CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type Period = "daily" | "weekly" | "monthly" | "custom";

const Dashboard = () => {
  const { products, invoices, sales, suppliers } = useStore();
  const [period, setPeriod] = useState<Period>("daily");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined } | undefined>();

  const now = new Date();
  const periodStart = useMemo(() => {
    const d = new Date(now);
    if (period === "daily") d.setHours(0, 0, 0, 0);
    else if (period === "weekly") d.setDate(d.getDate() - 7);
    else if (period === "monthly") d.setMonth(d.getMonth() - 1);
    return d;
  }, [period]);

  const filteredSales = useMemo(() => {
    if (period === "custom" && dateRange?.from) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
      to.setHours(23, 59, 59, 999);
      return sales.filter(s => {
        const d = new Date(s.date);
        return d >= from && d <= to;
      });
    }
    return sales.filter(s => new Date(s.date) >= periodStart);
  }, [sales, period, periodStart, dateRange]);

  const filteredInvoices = useMemo(() => {
    if (period === "custom" && dateRange?.from) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
      to.setHours(23, 59, 59, 999);
      return invoices.filter(i => {
        const d = new Date(i.date);
        return d >= from && d <= to;
      });
    }
    return invoices.filter(i => new Date(i.date) >= periodStart);
  }, [invoices, period, periodStart, dateRange]);

  const totalRevenue = filteredSales.reduce((a, s) => a + s.total, 0);
  const totalProfit = filteredSales.reduce((a, s) => a + s.profit, 0);
  const totalItemsSold = filteredSales.reduce((a, s) => a + s.itemCount, 0);
  const invoiceCount = filteredInvoices.length;

  const totalProducts = products.length;
  const totalStock = products.reduce((a, p) => a + p.stock, 0);
  const inventoryValue = products.reduce((a, p) => a + p.cost * p.stock, 0);
  const inventoryRetailValue = products.reduce((a, p) => a + p.price * p.stock, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const categoriesCount = new Set(products.map(p => p.category)).size;
  const repairServices = products.filter(p => p.category === "خدمات إصلاح").length;

  const periodLabel = period === "daily" ? "اليوم" 
    : period === "weekly" ? "هذا الأسبوع" 
    : period === "monthly" ? "هذا الشهر" 
    : "فترة مخصصة";

  const dateRepresentation = useMemo(() => {
    const end = new Date();
    if (period === "custom") {
      if (dateRange?.from) {
        if (dateRange.to) {
          return `${dateRange.from.toLocaleDateString('en-GB')} - ${dateRange.to.toLocaleDateString('en-GB')}`;
        }
        return dateRange.from.toLocaleDateString('en-GB');
      }
      return "";
    }
    
    if (period === "daily") {
      return periodStart.toLocaleDateString('en-GB');
    }
    
    return `${periodStart.toLocaleDateString('en-GB')} - ${end.toLocaleDateString('en-GB')}`;
  }, [period, periodStart, dateRange]);

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-sm text-muted-foreground">نظرة عامة على أداء المتجر</p>
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {([["daily", "يومي"], ["weekly", "أسبوعي"], ["monthly", "شهري"], ["custom", "مخصص"]] as const).map(([key, label]) => (
              <Button
                key={key}
                variant={period === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriod(key)}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {period === "custom" && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-right font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {dateRange.from.toLocaleDateString('en-GB')} - {dateRange.to.toLocaleDateString('en-GB')}
                      </>
                    ) : (
                      dateRange.from.toLocaleDateString('en-GB')
                    )
                  ) : (
                    <span>اختر فترة زمنية</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange as any}
                  onSelect={setDateRange as any}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-3 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>إحصائيات {periodLabel}</span>
            </div>
            {dateRepresentation && (
              <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-md self-start sm:self-auto">
                {dateRepresentation}
              </span>
            )}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatCard title="إجمالي المبيعات" value={`${totalRevenue.toLocaleString()} د.ج`} icon={DollarSign} variant="revenue" />
            <StatCard title="صافي الربح" value={`${totalProfit.toLocaleString()} د.ج`} icon={TrendingUp} variant="profit" />
            <StatCard title="المنتجات المباعة" value={totalItemsSold} icon={ShoppingCart} variant="info" />
            <StatCard title="عدد الفواتير" value={invoiceCount} icon={FileText} variant="warning" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-inventory" />
            إحصائيات المخزون
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatCard title="إجمالي المنتجات" value={totalProducts} icon={Package} variant="inventory" />
            <StatCard title="إجمالي الوحدات" value={totalStock.toLocaleString()} icon={Package} variant="info" />
            <StatCard title="قيمة المخزون (تكلفة)" value={`${inventoryValue.toLocaleString()} د.ج`} icon={DollarSign} variant="expense" />
            <StatCard title="قيمة المخزون (بيع)" value={`${inventoryRetailValue.toLocaleString()} د.ج`} icon={DollarSign} variant="revenue" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            تنبيهات و معلومات إضافية
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatCard title="مخزون منخفض" value={lowStockCount} icon={AlertTriangle} variant="warning" />
            <StatCard title="نفذ من المخزون" value={outOfStockCount} icon={AlertTriangle} variant="expense" />
            <StatCard title="عدد الموردين" value={suppliers.length} icon={Users} variant="info" />
            <StatCard title="الأقسام" value={categoriesCount} icon={Package} variant="inventory" />
            <StatCard title="خدمات الإصلاح" value={repairServices} icon={Wrench} variant="profit" />
            <StatCard title="إجمالي الفواتير" value={invoices.length} icon={FileText} variant="revenue" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
