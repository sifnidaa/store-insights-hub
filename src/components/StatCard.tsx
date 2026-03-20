import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant: "revenue" | "inventory" | "profit" | "expense" | "info" | "warning";
};

const StatCard = ({ title, value, icon: Icon, variant }: StatCardProps) => {
  return (
    <div className={`stat-card-${variant} rounded-xl p-4 md:p-5 animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs md:text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${variant}/10`}>
          <Icon className={`w-5 h-5 text-${variant}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
