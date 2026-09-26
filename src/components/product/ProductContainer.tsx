"use client";

import { useState, useMemo, useEffect } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { ImageGallery } from "@/components/product/ImageGallery";
import { VariantSelector, Variant } from "@/components/product/VariantSelector";
import { ProductTabs, Policy } from "@/components/product/ProductTabs";
import { WhatsAppButton } from "@/components/product/WhatsAppButton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Truck, CreditCard, Eye, ShoppingCart, MessageCircle, Heart, Share2, Info, Box } from "lucide-react";
import { Prisma } from "@prisma/client";
import { useCartStore } from "@/hooks/use-cart";
import { Price } from "@/components/ui/Price";
import { cn } from "@/lib/utils";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    variants: true;
    images: true;
    category: true;
  };
}>;

type VariantType = ProductWithRelations["variants"][number];

type ProductContainerProps = {
  product: ProductWithRelations;
  policies: Policy[];
  salesNumber: string;
  storeName?: { en: string; ar: string };
  installmentFromSettings?: { en: string; ar: string };
  flashSaleDiscount?: number;
  flashSaleEndDate?: Date | null;
};

export function ProductContainer({
  product,
  policies,
  salesNumber,
  installmentFromSettings,
  flashSaleDiscount = 0,
  flashSaleEndDate,
}: ProductContainerProps) {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const [mounted, setMounted] = useState(false);
  const [viewCount, setViewCount] = useState(31);

  useEffect(() => {
    setMounted(true);
    setViewCount(Math.floor(Math.random() * 40) + 15);
  }, []);

  // Map variants to UI format
  const mappedVariants: Variant[] = useMemo(() => {
    if (!product.variants) return [];
    return (product.variants as any[]).map((v) => ({
      id: v.id,
      weightGram: v.weightGram || 250,
      flavorAr: v.flavorAr || null,
      flavorEn: v.flavorEn || null,
      packageTypeAr: v.packageTypeAr || null,
      packageTypeEn: v.packageTypeEn || null,
      price: Number(v.price),
      discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
      stock: v.stockQuantity ?? 10,
      isDefault: v.isDefault || false,
      sku: v.sku || null,
      showPrice: true,
      sizeNameAr: v.weightGram >= 1000 ? `${v.weightGram / 1000} كجم` : `${v.weightGram || 250} جم`,
      sizeNameEn: v.weightGram >= 1000 ? `${v.weightGram / 1000}kg` : `${v.weightGram || 250}g`,
      colorAr: v.flavorAr || "",
      colorEn: v.flavorEn || "",
    }));
  }, [product.variants]);

  const defaultVariant = mappedVariants.find((v) => v.isDefault) || mappedVariants[0];
  const [activeVariant, setActiveVariant] = useState<Variant | undefined>(defaultVariant);

  // Price computation logic
  const priceInfo = useMemo(() => {
    const price = activeVariant?.price || 0;
    let finalPrice = price;
    let hasDiscount = false;
    let discountPercent = 0;
    let isFlashSale = false;
    let savedAmount = 0;

    if (flashSaleDiscount > 0) {
      const flashPrice = price * (1 - flashSaleDiscount / 100);
      const regularDiscountPrice = activeVariant?.discountPrice || null;

      if (!regularDiscountPrice || flashPrice <= regularDiscountPrice) {
        finalPrice = flashPrice;
        hasDiscount = true;
        discountPercent = flashSaleDiscount;
        isFlashSale = true;
      } else {
        finalPrice = regularDiscountPrice;
        hasDiscount = true;
        discountPercent = Math.round(((price - regularDiscountPrice) / price) * 100);
      }
    } else {
      const discountPrice = activeVariant?.discountPrice || null;
      if (discountPrice !== null && discountPrice > 0 && discountPrice < price) {
        finalPrice = discountPrice;
        hasDiscount = true;
        discountPercent = Math.round(((price - discountPrice) / price) * 100);
      }
    }

    finalPrice = Math.round(finalPrice);
    savedAmount = Math.round(price - finalPrice);
    return { price, hasDiscount, finalPrice, discountPercent, isFlashSale, savedAmount };
  }, [activeVariant, flashSaleDiscount]);

  const currency = isAr ? "ج.م" : "EGP";
  const productName = isAr ? product.nameAr : product.nameEn;
  const categoryName = isAr ? product.category?.nameAr : product.category?.nameEn;

  const variantLabel = [
    isAr ? (activeVariant?.weightGram ? `${activeVariant.weightGram} جم` : activeVariant?.sizeNameAr) : (activeVariant?.weightGram ? `${activeVariant.weightGram}g` : activeVariant?.sizeNameEn),
    isAr ? activeVariant?.flavorAr : activeVariant?.flavorEn,
  ].filter(Boolean).join(" · ");

  const isOutOfStock = !activeVariant || activeVariant.stock === 0;

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10">
      {/* Breadcrumb — Kabbani Style */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm mb-8 text-neutral-500 font-bold bg-neutral-50/50 p-3 rounded-xl border border-neutral-100 w-fit">
        <Link href="/" className="hover:text-[#e30613] transition-colors">{isAr ? "الرئيسية" : "Home"}</Link>
        <span className="text-neutral-300">|</span>
        <Link href="/shop" className="hover:text-[#e30613] transition-colors">{categoryName}</Link>
        <span className="text-neutral-300">|</span>
        <span className="text-neutral-900 font-extrabold">{productName}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {/* LEFT: Premium Gallery */}
        <div className="lg:col-span-7 space-y-6">
          <ImageGallery images={product.images || []} />

          {/* Social Icons - Desktop only */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-bold text-neutral-500 pt-4">
            <span>{isAr ? "مشاركة عبر:" : "Share via:"}</span>
            <button className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-[#e30613] hover:text-white transition-all"><Share2 size={16} /></button>
            <button className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><Heart size={16} /></button>
          </div>
        </div>

        {/* RIGHT: Product Meta - Kabbani Style */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 h-fit">

          {/* Title & Brand */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl lg:text-[28px] font-black text-[#111827] leading-tight">
              {productName}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{activeVariant?.sku}</span>
            </div>
          </div>

          {/* Price Block */}
          <div className="space-y-3 p-5 rounded-2xl bg-white border border-neutral-100 shadow-sm">
            {activeVariant?.showPrice ? (
              <div className="flex items-baseline gap-3 flex-wrap">
                <Price
                  amount={priceInfo.finalPrice}
                  className="text-3xl sm:text-4xl font-black text-[#e30613]"
                />
                {priceInfo.hasDiscount && (
                  <div className="flex items-center gap-2">
                    <span className="text-base text-neutral-400 line-through font-bold">
                      {priceInfo.price.toLocaleString("en-US")} {currency}
                    </span>
                    <div className="flex items-center gap-1 text-[#e30613] font-black text-sm">
                      <span className="hidden sm:inline">|</span>
                      <span>{isAr ? "وفر" : "Save"} {priceInfo.savedAmount.toLocaleString("en-US")} {currency}</span>
                      <span className="text-xs bg-red-50 px-2 py-0.5 rounded-full">({priceInfo.discountPercent}% off)</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-black text-primary">
                  {isAr ? "السعر عند الاستفسار" : "Price on Inquiry"}
                </span>
                <p className="text-xs font-bold text-neutral-400">
                  {isAr ? "تواصل معنا عبر الواتساب للحصول على تفاصيل السعر" : "Contact us on WhatsApp for price details"}
                </p>
              </div>
            )}

            {activeVariant?.showPrice && (
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 font-cairo">
                <Shield size={16} className="text-amber-600 shrink-0" />
                <span>{isAr ? "محمص طازج ومغلف بسحب الهواء للحفاظ على أعلى جودة وقرمشة" : "Freshly roasted and vacuum-sealed for premium freshness"}</span>
              </div>
            )}
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-600 pb-2">
            <Eye size={16} className="text-amber-600" />
            <span>{viewCount} {isAr ? "من عملائنا يشاهدون هذا المنتج الآن" : "customers are viewing this product"}</span>
          </div>

          {/* Variant Selector */}
          <div className="pt-4 border-t border-neutral-100">
            <VariantSelector
              variants={mappedVariants}
              onVariantChange={setActiveVariant}
              activeVariantId={activeVariant?.id || ""}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              disabled={isOutOfStock}
              onClick={() => {
                if (!activeVariant) return;
                const cartStore = useCartStore.getState();
                const exists = cartStore.items.some((item) => item.variantId === activeVariant.id);
                if (exists) { cartStore.setOpen(true); return; }
                cartStore.addItem({
                  productId: product.id,
                  variantId: activeVariant.id,
                  name: productName,
                  price: priceInfo.finalPrice,
                  image: product.images[0]?.url || "",
                  color: isAr ? (activeVariant.flavorAr || activeVariant.colorAr || "") : (activeVariant.flavorEn || activeVariant.colorEn || ""),
                  size: isAr ? (activeVariant.weightGram ? `${activeVariant.weightGram} جم` : activeVariant.sizeNameAr || "") : (activeVariant.weightGram ? `${activeVariant.weightGram}g` : activeVariant.sizeNameEn || ""),
                  quantity: 1,
                  slug: product.slug
                });
                cartStore.setOpen(true);
              }}
              className="flex-1 h-[55px] bg-[#0f172a] hover:bg-[#e30613] text-white rounded-xl text-lg font-black transition-all active:scale-[0.98] shadow-lg hover:shadow-red-500/25"
            >
              <ShoppingCart className="w-5 h-5 me-2" />
              {isAr ? "أضف إلى السلة" : "Add to Cart"}
            </Button>

            <WhatsAppButton
              productName={productName}
              variantId={activeVariant?.id || ""}
              variantLabel={variantLabel}
              price={priceInfo.finalPrice}
              slug={product.slug}
              salesNumber={salesNumber}
              isOutOfStock={isOutOfStock}
              className="flex-1 h-[55px] bg-[#25D366] hover:bg-[#1EBE5D] rounded-xl text-lg font-black text-white"
            />
          </div>


          {/* Description Block */}
          <div className="pt-6 border-t border-neutral-100">
            <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">
              {isAr ? "تفاصيل إضافية" : "Product Story"}
            </h3>
            <div className="text-neutral-500 text-sm leading-relaxed whitespace-pre-wrap">
              {isAr ? product.descAr : product.descEn}
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50/50 border border-neutral-100">
              <Box size={18} className="text-amber-600" />
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">{isAr ? "التحميص" : "Roast"}</span>
                <span className="text-xs font-bold">{isAr ? (product as any).roastTypeAr || "محمص طازج" : (product as any).roastTypeEn || "Fresh Roasted"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50/50 border border-neutral-100">
              <Shield size={18} className="text-amber-600" />
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">{isAr ? "المذاق" : "Quality"}</span>
                <span className="text-xs font-bold">{isAr ? ((product as any).isKeto ? "مناسب للكيتو" : "طبيعي 100%") : "100% Natural"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50/50 border border-neutral-100">
              <Truck size={18} className="text-amber-600" />
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">{isAr ? "التوصيل" : "Delivery"}</span>
                <span className="text-xs font-bold">{isAr ? "شحن لجميع المحافظات" : "Fast Egypt Delivery"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50/50 border border-neutral-100">
              <Info size={18} className="text-amber-600" />
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">{isAr ? "المنشأ" : "Origin"}</span>
                <span className="text-xs font-bold">{isAr ? (product as any).originCountryAr || "فاخر منتقى" : (product as any).originCountryEn || "Premium Quality"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-16 lg:mt-24">
        <ProductTabs
          product={product as any}
          activeVariant={activeVariant || {}}
          policies={policies}
        />
      </div>
    </div>
  );
}
