"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import { createReview } from "@/actions/review";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ReviewFormProps {
  productId?: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const { locale } = useLocale();
  const _isAr = locale === "ar";
  
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await createReview({
      productId,
      customerName: name,
      customerPhone: phone,
      rating,
      comment,
    });

    setLoading(false);
    if (result.success) {
      setMessage({
        type: "success",
        text: _isAr 
          ? "شكراً لتقييمك! سيتم مراجعته من قبل الإدارة قبل الظهور." 
          : "Thank you! Your review will be moderated before appearing.",
      });
      setName("");
      setPhone("");
      setComment("");
      setRating(5);
      if (onSuccess) onSuccess();
    } else {
      setMessage({
        type: "error",
        text: _isAr ? "عذراً، حدث خطأ أثناء إرسال التقييم." : "Sorry, an error occurred while submitting.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Star Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-700 mr-2">
          {_isAr ? "التقييم:" : "Rating:"}
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform active:scale-90"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hover || rating) ? "fill-primary text-primary" : "text-neutral-200"
                } transition-colors duration-200`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            {_isAr ? "الاسم" : "Name"}
          </label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={_isAr ? "أدخل اسمك" : "Enter your name"}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            {_isAr ? "رقم الجوال (اختياري)" : "Phone (Optional)"}
          </label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={_isAr ? "05xxxxxxxx" : "05xxxxxxxx"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          {_isAr ? "التعليق" : "Comment"}
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={_isAr ? "اكتب تعليقك هنا..." : "Write your comment here..."}
          rows={4}
        />
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {message.text}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold">
        {loading ? (_isAr ? "جاري الإرسال..." : "Submitting...") : (_isAr ? "إرسال التقييم" : "Submit Review")}
      </Button>
    </form>
  );
}
