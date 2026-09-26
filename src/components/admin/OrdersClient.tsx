"use client";

import { 
  MessageSquare, 
  Phone,
  MessageCircle,
  Clock3,
  CheckCircle,
  XCircle as CloseCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  product: { nameEn: string; nameAr: string };
  variant: { sizeNameEn: string | null; colorEn: string | null; sizeNameAr: string | null; colorAr: string|null } | null;
  createdAt: Date;
}

interface OrdersClientProps {
  orders: Order[];
}

export function OrdersClient({ orders }: OrdersClientProps) {
  const { t, locale, dir } = useLocale();
  const isRtl = dir === "rtl";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock3 className="h-4 w-4 text-orange-500" />;
      case "COMPLETED": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "CANCELLED": return <CloseCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock3 className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING": return t("statusPending");
      case "COMPLETED": return t("statusCompleted");
      case "CANCELLED": return t("statusCancelled");
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 font-playfair">{t("ordersTitle")}</h1>
        <p className="text-neutral-500 mt-1">{t("ordersSubtitle")}</p>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className={cn(
                "px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider",
                isRtl ? "text-right" : "text-left"
              )}>{t("columnCustomer")}</th>
              <th className={cn(
                "px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider",
                isRtl ? "text-right" : "text-left"
              )}>{t("columnProductVariant")}</th>
              <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">{t("columnDate")}</th>
              <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">{t("columnStatus")}</th>
              <th className={cn(
                "px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider",
                isRtl ? "text-left" : "text-right"
              )}>{t("columnActions")}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-neutral-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-bold text-neutral-900">{order.customerName}</div>
                    <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" />
                      {order.customerPhone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="max-w-xs overflow-hidden">
                    <div className="text-sm font-medium text-neutral-900 truncate">
                      {locale === "ar" ? order.product.nameAr : order.product.nameEn}
                    </div>
                    {order.variant && (
                      <div className="text-xs text-[#d8a868] font-medium">
                        {locale === "ar" 
                          ? (order.variant.sizeNameAr || order.variant.colorAr) 
                          : (order.variant.sizeNameEn || order.variant.colorEn)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-neutral-500">
                  {new Date(order.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800">
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className={cn(
                  "px-6 py-4 whitespace-nowrap",
                  isRtl ? "text-left" : "text-right"
                )}>
                  <Button variant="outline" size="sm" asChild className="rounded-xl border-neutral-200 hover:border-[#d8a868] hover:text-[#d8a868]">
                    <a href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
                      {t("chatNow")}
                    </a>
                  </Button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-10" />
                  <p>{t("noOrdersFound")}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
