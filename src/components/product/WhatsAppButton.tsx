"use client";

import { useLocale } from "@/i18n/LocaleContext";
import { MessageCircle } from "lucide-react";

type WhatsAppButtonProps = {
  productName: string;
  variantId: string;
  variantLabel: string;
  price: number;
  slug: string;
  salesNumber: string;
  isOutOfStock: boolean;
  className?: string;
};

export function WhatsAppButton({
  productName,
  variantId,
  variantLabel,
  price,
  // slug, // Unused
  salesNumber,
  isOutOfStock,
  className,
}: WhatsAppButtonProps) {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const handleClick = () => {
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    const currency = isAr ? "ر.س" : "SAR";

    // Send variantId (DB reference) for security, not just price
    let message = "";
    
    if (isOutOfStock) {
      message = isAr
        ? `السلام عليكم،\nأود الاستفسار عن موعد توفر المنتج التالي:\n\n*المنتج:* ${productName}\n*المقاس/النوع:* ${variantLabel}\n*الرمز المرجعي:* ${variantId.slice(0, 8)}\n\n*رابط المنتج:*\n${pageUrl}\n\nشكراً لكم.`
        : `Hi,\nI'd like to inquire about the availability of this product:\n\n*Product:* ${productName}\n*Variant:* ${variantLabel}\n*Ref Code:* ${variantId.slice(0, 8)}\n\n*Product Link:*\n${pageUrl}\n\nThank you.`;
    } else {
      message = isAr
        ? `السلام عليكم ورحمة الله وبركاته،\n\nأود الاستفسار عن المنتج التالي وإتمام طلب شرائه:\n\n*المنتج:* ${productName}\n*المقاس/النوع:* ${variantLabel}\n*السعر:* ${price} ${currency}\n*الرمز المرجعي (كود):* ${variantId.slice(0, 8)}\n\n*رابط المنتج:*\n${pageUrl}\n\nشكراً لكم.`
        : `Dear Customer Service,\n\nI would like to inquire about and proceed with ordering the following item:\n\n*Product:* ${productName}\n*Variant:* ${variantLabel}\n*Price:* ${price} ${currency}\n*Reference Code:* ${variantId.slice(0, 8)}\n\n*Product Link:*\n${pageUrl}\n\nThank you.`;
    }

    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = salesNumber.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className={className || `w-full flex items-center justify-center gap-3 font-bold py-4 px-6 rounded-xl transition-all text-lg shadow-lg active:scale-[0.98] ${
        isOutOfStock
          ? "bg-[#25D366] opacity-90 hover:opacity-100 text-white"
          : "bg-[#25D366] hover:bg-[#1EBE5D] text-white"
      }`}
    >
      <MessageCircle className="w-5 h-5 me-1" />
      {isOutOfStock
        ? isAr
          ? "استفسر عن موعد التوفر"
          : "Inquire about availability"
        : isAr
        ? "اطلب عبر واتساب"
        : "Order via WhatsApp"}
    </button>
  );
}
