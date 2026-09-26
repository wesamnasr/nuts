import { cn } from "@/lib/utils";
import Image from "next/image";

interface PriceProps {
  amount: number;
  className?: string;
  iconClassName?: string;
}

export function Price({ amount, className, iconClassName }: PriceProps) {
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="font-bold tabular-nums tracking-tight">
        {amount.toLocaleString("en-US")}
      </span>
      <div className={cn("relative w-8 h-8 opacity-90", iconClassName)}>
        <Image
          src="/SAR.svg"
          alt="SAR"
          fill
          className="object-contain"
          sizes="32px"
          priority
        />
      </div>
    </div>
  );
}
