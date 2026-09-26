"use client";

import { Star } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  createdAt: Date | string;
}

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-serif font-bold text-neutral-900">
          {isAr ? "آراء العملاء" : "Customer Reviews"}
        </h3>
        <div className="bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
          <span className="text-primary font-bold">
            {reviews.length} {isAr ? "تقييم" : "Reviews"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-neutral-900 mb-1">{review.customerName}</h4>
                <div className="flex gap-0.5 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-neutral-200"}`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase">
                {new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                }).format(new Date(review.createdAt))}
              </span>
            </div>
            {review.comment && (
              <p className="text-neutral-600 leading-relaxed italic">
                &ldquo;{review.comment}&rdquo;
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
