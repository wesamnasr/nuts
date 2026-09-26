"use client";

import { 
  Package, 
  Layers, 
  MessageSquare, 
  FileText, 
  PlusCircle,
  TrendingUp
} from "lucide-react";
import NextLink from "next/link";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/LocaleContext";

interface DashboardClientProps {
  stats: {
    productCount: number;
    categoryCount: number;
    orderCount: number;
    policyCount: number;
  };
  topProducts?: { name: string; count: number }[];
  error?: string;
}

export function DashboardClient({ stats, topProducts = [], error }: DashboardClientProps) {
  const { t } = useLocale();

  const statCards = [
    { label: t("totalProducts"), value: stats.productCount, icon: Package, color: "bg-blue-500" },
    { label: t("totalCategories"), value: stats.categoryCount, icon: Layers, color: "bg-orange-500" },
    { label: t("storeOrders"), value: stats.orderCount, icon: MessageSquare, color: "bg-green-500" },
    { label: t("activePolicies"), value: stats.policyCount, icon: FileText, color: "bg-purple-500" },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-10 animate-in fade-in duration-500">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-neutral-900 font-playfair uppercase">
          {t("welcomeAdmin")}
        </h1>
        <p className="text-neutral-500 text-xs sm:text-base font-medium opacity-80 max-w-2xl">
          {t("dashboardSubtitle")}
        </p>
        
        {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center justify-between text-xs sm:text-sm font-bold animate-in slide-in-from-top-2">
              <p>{error}</p>
            </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-5 sm:p-6 rounded-[2rem] sm:rounded-3xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group">
            <div className="flex flex-row xs:flex-col lg:flex-row items-center xs:items-start lg:items-center gap-4">
              <div className={`${stat.color} p-3.5 sm:p-4 rounded-2xl text-white shadow-xl shadow-${stat.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-black text-neutral-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-black text-neutral-900 mt-0.5 font-playfair">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-neutral-900 text-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] space-y-6 sm:space-y-8 shadow-2xl shadow-neutral-900/20">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-2xl font-black flex items-center gap-3 font-playfair uppercase tracking-tight">
              <PlusCircle className="h-6 w-6 text-primary" />
              {t("quickActions")}
            </h2>
            <p className="text-neutral-500 text-[10px] sm:text-xs font-medium uppercase tracking-widest">
              {t("shortcuts") || "Access management quickly"}
            </p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <Button asChild className="w-full justify-start bg-white/5 hover:bg-white/10 border border-white/10 h-12 sm:h-14 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-tight transition-all active:scale-[0.98]">
              <NextLink href="/admin/products">{t("manageProducts")}</NextLink>
            </Button>
            <Button asChild className="w-full justify-start bg-white/5 hover:bg-white/10 border border-white/10 h-12 sm:h-14 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-tight transition-all active:scale-[0.98]">
              <NextLink href="/admin/categories">{t("editCategories")}</NextLink>
            </Button>
            <Button asChild className="w-full justify-start bg-white/5 hover:bg-white/10 border border-white/10 h-12 sm:h-14 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-tight transition-all active:scale-[0.98]" variant="outline">
              <NextLink href="/admin/settings">{t("globalSettings")}</NextLink>
            </Button>
          </div>
        </div>

        {/* Top Products - Store Summary */}
        <div className="lg:col-span-2 bg-white border p-6 sm:p-8 rounded-[2rem] sm:rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              {t("topOrderedProducts") || "أكثر المنتجات طلباً"}
            </h2>
          </div>
          
          {topProducts.length > 0 ? (
            <div className="space-y-6 sm:space-y-8 mt-4 sm:mt-6">
              {topProducts.map((product, index) => {
                const maxCount = Math.max(...topProducts.map(p => p.count));
                const percentage = Math.max(10, Math.round((product.count / maxCount) * 100));
                
                return (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between text-xs sm:text-sm font-black uppercase tracking-tight">
                      <span className="truncate max-w-[65%] sm:max-w-[70%] text-neutral-900">{product.name}</span>
                      <span className="text-primary">{product.count} {t("orders") || "طلب"}</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2 sm:h-3 overflow-hidden p-0.5 border border-neutral-50 shadow-inner">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-1000 ease-out shadow-lg shadow-primary/40" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-neutral-400 space-y-4">
              <div className="h-12 w-12 rounded-full bg-neutral-50 flex items-center justify-center">
                <Package className="h-6 w-6 opacity-20" />
              </div>
              <p className="text-xs sm:text-sm text-center max-w-[200px] sm:max-w-none px-4">
                {t("noOrdersYet") || "لم يتم تسجيل أي طلبات بعد عبر الواتساب لتحديد المنتجات الأكثر طلباً."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
