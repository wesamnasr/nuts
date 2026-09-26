"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { Store } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps extends Omit<ImageProps, "src" | "alt"> {
  src?: string | null;
  alt: string;
}

export function ProductImage({ src, alt, className, ...props }: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-[#f5f5dc] ${className}`}>
        <div className="text-center opacity-30 sepia">
           <Store className="w-12 h-12 mx-auto mb-2 text-[#8B5E3C]" />
           <span className="font-serif font-bold text-[#8B5E3C] text-xs">New Concept</span>
        </div>
      </div>
    );
  }

  const optimizedSrc = src;

  return (
    <div className={cn("relative overflow-hidden w-full h-full", className)}>
      <Image
        {...props}
        src={optimizedSrc}
        alt={alt}
        className={cn(
          "transition-all duration-700 z-10",
          isLoading ? "scale-110 blur-lg grayscale" : "scale-100 blur-0 grayscale-0",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  );
}
