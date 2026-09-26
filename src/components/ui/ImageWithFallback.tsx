"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string;
  fallbackText?: string;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  fallbackSrc = "https://placehold.co/600x400?text=No+Image", 
  className,
  fallbackText,
  ...props 
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error) {
     if (fallbackText) {
        return (
            <div className={cn("flex flex-col items-center justify-center bg-neutral-100 text-neutral-400", className)}>
                <ImageOff className="w-8 h-8 mb-2" />
                <span className="text-xs">{fallbackText}</span>
            </div>
        )
     }
  }

  return (
    <Image
      {...props}
      key={String(src)} // Reset error state when src changes
      alt={alt}
      src={error ? fallbackSrc : src}
      className={className}
      onError={() => {
        setError(true);
      }}
      // Ensure we don't try to optimize external fallback URLs if they aren't configured
      unoptimized={error || (typeof src === 'string' && (src.startsWith('http') && !src.includes('res.cloudinary.com') && !src.includes('blob.vercel-storage.com')))}
    />
  );
}
