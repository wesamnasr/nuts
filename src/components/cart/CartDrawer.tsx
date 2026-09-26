"use client"

import { useCartStore } from "@/hooks/use-cart";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter 
} from "@/components/ui/sheet";
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  MessageCircle,
  X,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Price } from "@/components/ui/Price";
import { motion, AnimatePresence } from "framer-motion";

export function CartDrawer({ open, setOpen, whatsappNumber, storeName }: { 
  open: boolean; 
  setOpen: (open: boolean) => void;
  whatsappNumber?: string;
  storeName?: string;
}) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  
  const [isMounted, setIsMounted] = useState(false);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Fix hydration issue for client-side persistence
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleWhatsAppCheckout = () => {
    // Standardize phone number: remove +, spaces, and add 966 if missing
    let wpNumber = whatsappNumber || "966570581224";
    wpNumber = wpNumber.replace(/\D/g, ""); // Remove non-digits
    if (wpNumber.startsWith("0")) wpNumber = wpNumber.substring(1);
    if (!wpNumber.startsWith("966")) wpNumber = "966" + wpNumber;

    const brand = storeName || "New Concept";
    
    let message = `مرحباً *${brand}* 👋\n`;
    message += "أود إتمام طلب شراء للمنتجات التالية:\n\n";
    
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   ▫️ الكمية: ${item.quantity}\n`;
      if (item.color) message += `   ▫️ اللون: ${item.color}\n`;
      if (item.size) message += `   ▫️ المقاس: ${item.size}\n`;
      message += `   ▫️ المجموع: ${item.price * item.quantity} ر.س\n`;
      message += `-------------------------\n`;
    });

    message += `\n💰 *الإجمالي النهائي:* ${totalPrice.toLocaleString()} ر.س\n\n`;
    message += "بانتظار تأكيد الطلب، شكراً لكم!";
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${wpNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 rounded-l-[30px] border-none bg-[#FAFAFA] shadow-2xl">
        <SheetHeader className="p-6 border-b bg-white">
          <SheetTitle className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
            <ShoppingBag className="h-6 w-6 text-[#8B5E3C]" />
            سلة التسوق <span className="text-base font-normal text-neutral-500">({totalItems})</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70"
              >
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="h-10 w-10 text-neutral-400" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">سلتك فارغة</h3>
                <p className="text-neutral-500 text-sm">لم تقم بإضافة أي منتجات للسلة بعد.</p>
                <button 
                  onClick={() => setOpen(false)} 
                  className="mt-4 text-[#8B5E3C] font-bold flex items-center gap-2 hover:gap-3 transition-all"
                >
                  العودة للتسوق <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </motion.div>
            ) : (
              items.map((item) => (
                <motion.div 
                  layout
                  key={item.variantId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-neutral-900 text-sm line-clamp-2 leading-snug">{item.name}</h3>
                        <button 
                          onClick={() => removeItem(item.variantId)}
                          aria-label="حذف المنتج"
                          className="text-neutral-300 hover:text-red-500 transition-colors -mt-1 -mr-1 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 flex gap-2">
                        {item.color && <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[10px]">{item.color}</span>}
                        {item.size && <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[10px]">{item.size}</span>}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <Price 
                        amount={item.price}
                        className="text-[#8B5E3C] font-bold text-sm"
                        iconClassName="w-4 h-4"
                      />
                      <div className="flex items-center bg-neutral-50 rounded-lg border border-neutral-200 h-8">
                        <button 
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="تقليل الكمية"
                          className="px-2 h-full hover:bg-neutral-200 disabled:opacity-50 text-neutral-600 transition-colors rounded-r-lg"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-bold min-w-[24px] text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          aria-label="زيادة الكمية"
                          className="px-2 h-full hover:bg-neutral-200 text-neutral-600 transition-colors rounded-l-lg"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {items.length > 0 && (
          <SheetFooter className="p-6 bg-white border-t space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10 flex-col sm:flex-col">
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-neutral-600">
                <span>المجموع الفرعي</span>
                <Price amount={totalPrice} className="font-medium" iconClassName="w-4 h-4" />
              </div>
              <div className="flex justify-between items-center text-xl font-bold border-t pt-3 border-dashed">
                <span>الإجمالي النهائي</span>
                <Price amount={totalPrice} className="text-[#8B5E3C]" iconClassName="w-6 h-6" />
              </div>
            </div>
            
            <button 
              className="relative w-full h-14 bg-[#25D366] hover:bg-[#128C7E] rounded-xl flex items-center justify-center gap-3 text-white text-lg font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-200/50 overflow-hidden group"
              onClick={handleWhatsAppCheckout}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <MessageCircle className="h-6 w-6 relative z-10" />
              <span className="relative z-10">إتمام الطلب عبر واتساب</span>
            </button>
            <p className="text-[10px] text-center text-neutral-400">
              سيتم نقلك إلى تطبيق واتساب لإرسال تفاصيل الطلب مباشرة
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
