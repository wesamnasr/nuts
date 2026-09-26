"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { Hero } from "@/components/sections/Hero";
import { FlashSales } from "@/components/sections/FlashSales";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { FeaturesSection } from "@/components/sections/FeaturesSection";

import { NewArrivals } from "@/components/sections/NewArrivals";
import { BestSellers } from "@/components/sections/BestSellers";
import { Testimonials } from "@/components/sections/Testimonials";
import { CustomerPhotos } from "@/components/sections/CustomerPhotos";
import { StoreMap } from "@/components/sections/StoreMap";
import { FadeIn } from "@/components/FadeIn";

import { GenericProductSection } from "@/components/sections/GenericProductSection";

import { type StorefrontProduct as FeaturedProduct } from "@/lib/transformers";

type ProductCollection = {
    id: string;
    titleAr: string;
    titleEn: string;
    products: FeaturedProduct[];
};

type Category = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  image: string | null;
  _count: { products: number };
};

type Testimonial = {
  id: string;
  nameAr: string; 
  nameEn: string;
  roleAr: string;
  roleEn: string;
  textAr: string;
  textEn: string;
  image: string | null;
  rating: number;
};

type CustomerPhoto = {
  id: string;
  image: string;
  altText: string | null;
};

type StoreFeature = {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
};

import { LandingPageConfig } from "@/actions/landing";

type HomeClientProps = {
  newArrivals: FeaturedProduct[];
  bestSellers: FeaturedProduct[];
  flashSaleProducts: FeaturedProduct[];
  categories: Category[];
  testimonials?: Testimonial[];
  customerPhotos?: CustomerPhoto[];
  landingConfig?: LandingPageConfig;
  storeFeatures?: StoreFeature[];
  dynamicCollections?: ProductCollection[];
  locationSettings?: {
    mapCoordinates?: string;
    googleMapsUrl?: string;
    addressEn?: string;
    addressAr?: string;
  };
};

export function HomeClient({ 
  newArrivals: initialNewArrivals,
  bestSellers: initialBestSellers,
  flashSaleProducts: initialFlashSaleProducts = [],
  categories, 
  testimonials = [],
  customerPhotos = [],
  landingConfig,
  storeFeatures = [],
  dynamicCollections = [],
  locationSettings,
}: HomeClientProps) {
  const { locale, dir } = useLocale();

  // Handle Date serialization from Server Component
  const formatProducts = (prods: FeaturedProduct[]) => prods.map(p => ({
    ...p,
    createdAt: new Date(p.createdAt)
  }));

  const newArrivals = useMemo(() => formatProducts(initialNewArrivals), [initialNewArrivals]);
  const bestSellers = useMemo(() => formatProducts(initialBestSellers), [initialBestSellers]);
  const flashSaleProducts = useMemo(() => formatProducts(initialFlashSaleProducts), [initialFlashSaleProducts]);
  
  // Also format products inside dynamic collections
  const formattedCollections = useMemo(() => {
    return dynamicCollections.map(c => ({
        ...c,
        products: formatProducts(c.products)
    }));
  }, [dynamicCollections]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  // Default to showing everything if config is missing (safety fallback)
  const showHero = landingConfig?.showHero ?? true;
  const showCategories = landingConfig?.showCategories ?? true;
  const showNewArrivals = landingConfig?.showNewArrivals ?? true;
  const showBestSellers = landingConfig?.showBestSellers ?? true;
  const showFlashSales = landingConfig?.showFlashSales ?? true;
  const showTestimonials = landingConfig?.showTestimonials ?? true;
  const showCustomerPhotos = landingConfig?.showCustomerPhotos ?? true;
  const showFeatures = landingConfig?.showFeatures ?? true;

  const sectionsOrder = landingConfig?.sectionsOrder || [
    "hero",
    "categories",
    "new_arrivals",
    "best_sellers",
    "flash_sale",
    "testimonials",
    "customer_photos",
    "features",
  ];

  const renderSection = (sectionId: string) => {
    if (sectionId.startsWith("collection_")) {
        const collectionId = sectionId.replace("collection_", "");
        const collection = formattedCollections.find(c => c.id === collectionId);
        if (collection && collection.products.length > 0) {
            return (
                <GenericProductSection 
                    key={sectionId}
                    products={collection.products}
                    titleAr={collection.titleAr}
                    titleEn={collection.titleEn}
                />
            );
        }
        return null;
    }

    switch (sectionId) {
      case "hero":
        return showHero ? <Hero key="hero" config={landingConfig} /> : null;
      case "categories":
        return showCategories ? (
          <FadeIn key="categories">
            <CategoryGrid categories={categories} />
          </FadeIn>
        ) : null;
      case "new_arrivals":
        return showNewArrivals ? (
          <FadeIn key="new_arrivals" delay={0.1}>
            <NewArrivals products={newArrivals} />
          </FadeIn>
        ) : null;
      case "best_sellers":
        return showBestSellers ? (
          <FadeIn key="best_sellers" delay={0.1}>
            <BestSellers products={bestSellers} />
          </FadeIn>
        ) : null;
      case "flash_sale":
        return showFlashSales ? (
          <FadeIn key="flash_sale" delay={0.2}>
            <FlashSales products={flashSaleProducts} endDate={landingConfig?.flashSaleEndDate} discount={landingConfig?.flashSaleDiscount || 0} serverTime={new Date()} />
          </FadeIn>
        ) : null;
      case "testimonials":
        return showTestimonials ? (
          <FadeIn key="testimonials" direction="left">
            <Testimonials testimonials={testimonials} />
          </FadeIn>
        ) : null;
      case "customer_photos":
        return showCustomerPhotos ? (
          <FadeIn key="customer_photos" direction="right">
            <CustomerPhotos photos={customerPhotos} />
          </FadeIn>
        ) : null;
      case "features":
        return showFeatures ? (
          <FadeIn key="features" direction="up" delay={0.3}>
            <FeaturesSection customFeatures={storeFeatures} />
          </FadeIn>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral/10">
      <main>
        {sectionsOrder.map((sectionId) => renderSection(sectionId))}
        <StoreMap 
          mapCoordinates={locationSettings?.mapCoordinates}
          googleMapsUrl={locationSettings?.googleMapsUrl}
          addressEn={locationSettings?.addressEn}
          addressAr={locationSettings?.addressAr}
        />
      </main>
    </div>
  );
}
