"use client";

import { Headphones, ShoppingBag } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";

interface WhatsAppMenuProps {
    isOpen: boolean;
    salesNumber?: string;
    customerSupportNumber?: string;
    className?: string; // To control position/styling from outside
}

export function WhatsAppMenu({
    isOpen,
    salesNumber,
    customerSupportNumber,
    className
}: WhatsAppMenuProps) {
    const { t, dir } = useLocale();

    const handleWhatsAppClick = (number: string) => {
        const cleanNumber = number.replace(/[^\d+]/g, "");
        window.open(`https://wa.me/${cleanNumber}`, "_blank");
    };

    if (!salesNumber && !customerSupportNumber) return null;

    return (
        <div
            className={cn(
                "fixed z-50 flex flex-col gap-3 transition-all duration-300 origin-bottom",
                dir === "rtl"
                    ? "items-start"
                    : "items-end",
                isOpen
                    ? "scale-100 opacity-100 pointer-events-auto"
                    : "scale-0 opacity-0 pointer-events-none",
                className // Allows overriding bottom/left/right positions
            )}
        >
            {salesNumber && (
                <button
                    onClick={() => handleWhatsAppClick(salesNumber)}
                    className="group flex items-center gap-3 bg-white text-neutral-800 p-2.5 sm:p-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all w-max border border-neutral-100"
                >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm px-2">
                        {t("whatsappSales")}
                    </span>
                </button>
            )}

            {customerSupportNumber && (
                <button
                    onClick={() => handleWhatsAppClick(customerSupportNumber)}
                    className="group flex items-center gap-3 bg-white text-neutral-800 p-2.5 sm:p-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all w-max border border-neutral-100"
                >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm px-2">
                        {t("whatsappSupport")}
                    </span>
                </button>
            )}
        </div>
    );
}
