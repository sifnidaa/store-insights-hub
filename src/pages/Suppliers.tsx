import DashboardLayout from "@/components/DashboardLayout";
import { useStore } from "@/contexts/StoreContext";
import { Users, Phone, Mail, MapPin, DollarSign } from "lucide-react";

const Suppliers = () => {
  const { suppliers } = useStore();

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-info" />
          الموردين
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className="bg-card rounded-xl border p-4 space-y-3 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-base">{s.name}</h3>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-info" />{s.phone}</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" />{s.email}</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-revenue" />{s.address}</p>
                <p className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-profit" />إجمالي المشتريات: {s.totalPurchases.toLocaleString()} ر.س</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Suppliers;
