"use client";

import { useLocale } from "@/i18n/LocaleContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ReviewForm } from "./ReviewForm";
import { Quote } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
}

export function ReviewModal({ isOpen, onOpenChange, productId }: ReviewModalProps) {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <div className="bg-white dark:bg-neutral-900">
          <DialogHeader className="p-8 pb-4 text-start">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Quote className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-serif font-bold text-neutral-900 dark:text-white">
                {isAr ? "شكراً لمشاركتنا رأيك" : "Thanks for Sharing Your Feedback"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-neutral-500 dark:text-neutral-400">
              {isAr 
                ? "رأيك يساعدنا على التطوير ويساعد المتسوقين في اتخاذ قراراتهم." 
                : "Your feedback helps us improve and assists other shoppers in making informed decisions."}
            </DialogDescription>
          </DialogHeader>

          <div className="p-2">
            <ReviewForm 
              productId={productId} 
              onSuccess={() => {
                // Wait a bit before closing to show the success message
                setTimeout(() => onOpenChange(false), 3000);
              }} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
