"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, CheckCircle, XCircle, Trash2, Clock, MessageSquare, Heart } from "lucide-react";
import Image from "next/image";
import { useLocale } from "@/i18n/LocaleContext";
import { getReviews, updateReviewStatus, deleteReview, toggleReviewFeatured } from "@/actions/review";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  customerImage?: string | null;
  customerName: string;
  customerRoleAr?: string | null;
  customerRoleEn?: string | null;
  customerPhone?: string | null;
  isFeatured: boolean;
  isApproved: boolean;
  rating: number;
  commentAr?: string | null;
  commentEn?: string | null;
  comment?: string | null;
  product?: {
    nameAr: string;
    nameEn: string;
    slug: string;
  } | null;
  createdAt: string | Date;
}

export default function ReviewManagerPage() {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "featured">("all");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const result = await getReviews(filter);
    if (result.success) {
      setReviews((result.data as Review[]) || []);
    } else {
      toast.error(isAr ? "فشل تحميل التقييمات" : "Failed to load reviews");
    }
    setLoading(false);
  }, [filter, isAr]);

  useEffect(() => {
    let isSubscribed = true;
    
    const load = async () => {
      const result = await getReviews(filter);
      if (isSubscribed) {
        if (result.success) {
          setReviews((result.data as Review[]) || []);
        } else {
          toast.error(isAr ? "فشل تحميل التقييمات" : "Failed to load reviews");
        }
        setLoading(false);
      }
    };
    
    load();
    return () => { isSubscribed = false; };
  }, [filter, isAr]);

  const handleStatusUpdate = async (id: string, isApproved: boolean) => {
    const result = await updateReviewStatus(id, isApproved);
    if (result.success) {
      toast.success(isAr ? "تم تحديث الحالة" : "Status updated");
      fetchReviews();
    } else {
      toast.error(isAr ? "فشل التحديث" : "Update failed");
    }
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    const result = await toggleReviewFeatured(id, isFeatured);
    if (result.success) {
      toast.success(isAr ? "تم تحديث حالة التمييز" : "Feature status updated");
      fetchReviews();
    } else {
      toast.error(isAr ? "فشل التحديث" : "Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذا التقييم؟" : "Are you sure you want to delete this review?")) return;
    
    const result = await deleteReview(id);
    if (result.success) {
      toast.success(isAr ? "تم حذف التقييم" : "Review deleted");
      fetchReviews();
    } else {
      toast.error(isAr ? "فشل الحذف" : "Deletion failed");
    }
  };


  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 pb-24 sm:pb-8">
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_auto] items-stretch lg:items-center justify-between gap-8">
        <div className="space-y-2 text-center lg:text-left">
          <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 font-playfair tracking-tight uppercase">
            {isAr ? "إدارة التقييمات والآراء" : "Reviews & Testimonials"}
          </h1>
          <p className="text-neutral-500 text-[10px] sm:text-sm font-medium opacity-80 max-w-lg mx-auto lg:mx-0 leading-relaxed uppercase tracking-tighter">
            {isAr ? "راجع واعتمد تقييمات المنتجات والآراء العامة." : "Moderate product reviews and general testimonials for your furniture store."}
          </p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <div className="flex items-center gap-2 bg-neutral-100/50 p-1.5 rounded-2xl border border-neutral-200/60 shrink-0 shadow-inner">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className={cn("rounded-xl font-black text-[10px] h-10 px-6 uppercase tracking-tight transition-all", filter === "all" ? "bg-[#FF7F11] text-white shadow-lg shadow-[#FF7F11]/20 -translate-y-0.5" : "text-neutral-500 hover:bg-white")}
            >
              {isAr ? "الكل" : "All"}
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("pending")}
              className={cn("rounded-xl font-black text-[10px] h-10 px-6 uppercase tracking-tight transition-all", filter === "pending" ? "bg-[#FF7F11] text-white shadow-lg shadow-[#FF7F11]/20 -translate-y-0.5" : "text-neutral-500 hover:bg-white")}
            >
              {isAr ? "الانتظار" : "Pending"}
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("approved")}
              className={cn("rounded-xl font-black text-[10px] h-10 px-6 uppercase tracking-tight transition-all", filter === "approved" ? "bg-[#FF7F11] text-white shadow-lg shadow-[#FF7F11]/20 -translate-y-0.5" : "text-neutral-500 hover:bg-white")}
            >
              {isAr ? "المعتمدة" : "Approved"}
            </Button>
            <Button
              variant={filter === "featured" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("featured")}
              className={cn("rounded-xl font-black text-[10px] h-10 px-6 uppercase tracking-tight transition-all flex items-center gap-2", filter === "featured" ? "bg-[#FF7F11] text-white shadow-lg shadow-[#FF7F11]/20 -translate-y-0.5" : "text-neutral-500 hover:bg-white")}
            >
              <Heart className={cn("w-3.5 h-3.5", filter === "featured" ? "fill-current" : "")} />
              {isAr ? "المختارة" : "Featured"}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200 shadow-sm">
          <MessageSquare className="w-16 h-16 text-neutral-100 mx-auto mb-4" />
          <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight font-playfair">
            {isAr ? "لا توجد تقييمات حالياً" : "No reviews found"}
          </h3>
          <p className="text-neutral-400 text-sm mt-1">{isAr ? "سيتم عرض التقييمات هنا بمجرد وصولها." : "Reviews will appear here once received."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-2xl sm:rounded-3xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all ${review.isFeatured ? "ring-2 ring-primary bg-primary/2" : ""}`}
            >
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    {review.customerImage ? (
                      <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-neutral-100 shadow-sm shrink-0">
                        <Image 
                          src={review.customerImage} 
                          alt={review.customerName} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg sm:text-xl uppercase shrink-0">
                        {review.customerName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-black text-neutral-900 truncate text-sm sm:text-base">{review.customerName}</h4>
                      <p className="text-[10px] sm:text-xs text-neutral-400 font-medium truncate">
                        {review.customerRoleAr || review.customerRoleEn || review.customerPhone || (isAr ? "بدون معلومات" : "No Info")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    {review.isFeatured && (
                       <Badge className="bg-primary hover:bg-primary/90 text-white gap-1 text-[10px] h-6 px-2 rounded-lg font-bold">
                        <Heart className="w-2.5 h-2.5 fill-current" />
                        {isAr ? "رئيسية" : "Featured"}
                      </Badge>
                    )}
                    <Badge variant={review.isApproved ? "default" : "secondary"} className="rounded-lg text-[10px] h-6 px-2 font-bold">
                      {review.isApproved ? (isAr ? "معتمد" : "Approved") : (isAr ? "قيد الانتظار" : "Pending")}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-neutral-200"}`}
                    />
                  ))}
                </div>

                <div className="p-3 sm:p-4 bg-neutral-50/50 rounded-2xl border border-neutral-100 italic text-neutral-700 text-xs sm:text-sm leading-relaxed min-h-[60px] sm:min-h-[80px]">
                  {isAr ? (review.commentAr || review.comment) : (review.commentEn || review.comment) || (isAr ? "بدون تعليق" : "No comment")}
                </div>

                {review.product && (
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-neutral-500 bg-neutral-50 p-2 px-3 rounded-xl border border-neutral-100 w-fit">
                    <span className="font-bold uppercase tracking-wider opacity-60 shrink-0">{isAr ? "المنتج:" : "Product:"}</span>
                    <span className="text-primary font-black truncate max-w-[150px]">{isAr ? review.product.nameAr : review.product.nameEn}</span>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2 gap-4">
                  <span className="text-[10px] sm:text-xs text-neutral-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Intl.DateTimeFormat(isAr ? "ar-SA" : "en-US", {
                      day: "numeric", month: "long", year: "numeric"
                    }).format(new Date(review.createdAt))}
                  </span>
                  
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleFeatured(review.id, !review.isFeatured)}
                      className={cn(
                        "flex-1 sm:flex-none rounded-xl px-3 sm:px-4 h-9 font-bold text-xs gap-2 transition-all active:scale-[0.98]",
                        review.isFeatured ? "bg-primary/10 border-primary/20 text-primary shadow-sm" : "text-neutral-500 border-neutral-200"
                      )}
                    >
                      <Heart className={cn("w-3.5 h-3.5", review.isFeatured ? "fill-current" : "")} />
                      <span className="whitespace-nowrap">{review.isFeatured ? (isAr ? "رئيسية" : "Featured") : (isAr ? "تمييز" : "Feature")}</span>
                    </Button>

                    {review.isApproved ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(review.id, false)}
                        className="flex-1 sm:flex-none rounded-xl px-3 sm:px-4 h-9 text-amber-600 border-amber-200 hover:bg-amber-50 font-bold text-xs gap-2 transition-all active:scale-[0.98]"
                      >
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">{isAr ? "إخفاء" : "Hide"}</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(review.id, true)}
                        className="flex-1 sm:flex-none rounded-xl px-3 sm:px-4 h-9 bg-green-50 text-green-600 border-green-100 hover:bg-green-100 font-bold text-xs gap-2 transition-all active:scale-[0.98]"
                      >
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">{isAr ? "اعتماد" : "Approve"}</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(review.id)}
                      className="h-9 w-9 shrink-0 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
