"use client";

import { ProductCard } from "@/components/ui/ProductCard";
import { type StorefrontProduct as Product } from "@/lib/transformers";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  showFlashSale?: boolean;
  flashSaleEndDate?: Date;
}

const gridColsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

export function ProductGrid({ 
  products, 
  columns = { mobile: 2, tablet: 2, desktop: 4 },
  showFlashSale,
  flashSaleEndDate
}: ProductGridProps) {
  if (!products.length) return null;

  const mobileCols = gridColsMap[columns.mobile as keyof typeof gridColsMap] || 'grid-cols-1';
  const tabletCols = gridColsMap[columns.tablet as keyof typeof gridColsMap] || 'sm:grid-cols-2';
  const desktopCols = gridColsMap[columns.desktop as keyof typeof gridColsMap] || 'lg:grid-cols-4';

  return (
    <div className={cn("grid gap-6", mobileCols, tabletCols, desktopCols)}>
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          showFlashSale={showFlashSale}
          flashSaleEndDate={flashSaleEndDate}
        />
      ))}
    </div>
  );
}
