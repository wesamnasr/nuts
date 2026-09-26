"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/LocaleContext";

interface PriceProps {
  amount: number;
  className?: string;
  iconClassName?: string;
}

export function Price({ amount, className }: PriceProps) {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  return (
    <div className={cn("inline-flex items-baseline gap-1 font-cairo", className)}>
      <span className="font-bold tabular-nums tracking-tight">
        {amount.toLocaleString("en-US")}
      </span>
      <span className="text-xs font-bold text-amber-700">
        {isAr ? "ج.م" : "EGP"}
      </span>
    </div>
  );
}
