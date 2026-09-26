"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import { Button } from "@/components/ui/button";
import { ReviewModal } from "./ReviewModal";
import { ReviewList } from "./ReviewList";

interface ReviewSectionProps {
  productId: string;
  initialReviews: any[];
}

export function ReviewSection({ productId, initialReviews }: ReviewSectionProps) {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="w-[90%] max-w-[2000px] mx-auto px-4 py-16 md:py-24 space-y-16">
      {/* Add Review Button (Now at Top) */}
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <Button 
          onClick={() => setShowForm(true)}
          variant="outline"
          className="h-14 px-8 rounded-2xl border-2 gap-3 text-lg font-bold hover:bg-primary/5 transition-all"
        >
          <MessageSquarePlus className="w-6 h-6" />
          {isAr ? "أضف تقييمك" : "Add Your Review"}
        </Button>

        <ReviewModal 
          isOpen={showForm} 
          onOpenChange={setShowForm} 
          productId={productId}
        />
      </div>

      {/* Reviews List */}
      {initialReviews.length > 0 && (
        <div className="max-w-4xl mx-auto pt-8 border-t border-neutral-100">
          <ReviewList reviews={initialReviews} />
        </div>
      )}
    </section>
  );
}
