import { getFeaturedProducts, getNewArrivals, getBestSellers, getProductsByIds } from "@/actions/product";
import { getCategories } from "@/actions/category";
import { getSettings, type SettingsMap } from "@/actions/settings";
import { HomeClient } from "@/components/HomeClient";
import { getLandingConfig } from "@/actions/landing";
import { getFeaturedReviews } from "@/actions/review";
import { getActiveCustomerPhotos } from "@/actions/customer-photo";
import { getActiveStoreFeatures } from "@/actions/store-feature";
import { getActiveCollections } from "@/actions/collections";
import { type StorefrontProduct } from "@/lib/transformers";

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

type ProductCollection = {
    id: string;
    titleAr: string;
    titleEn: string;
    products: StorefrontProduct[];
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

type Category = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  image: string | null;
  _count: { products: number };
};

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSettings();
  const storeName = settings.storeNameEn || "New Concept";
  const description = settings.descriptionEn || "Luxury furniture and premium interior design in Saudi Arabia.";
  
  return {
    title: `New Concept | ${storeName}`,
    description: description,
    keywords: "furniture, decor, interior design, luxury, bedrooms, dining rooms, sofas, Jeddah, Saudi Arabia",
    openGraph: {
      title: `${storeName} | Luxury Furniture`,
      description: description,
      url: "https://yourwebsite.com",
      siteName: storeName,
      images: [
        {
          url: "https://res.cloudinary.com/dxgvn3gad/image/upload/v1771868786/furniture_store/o62wzklmikhx7evkoeyf.webp",
          width: 1200,
          height: 630,
          alt: `${storeName} Showroom`,
        },
      ],
      locale: "ar_SA",
      type: "website",
    },
    alternates: {
      canonical: "https://yourwebsite.com",
    },
  };
}

export default async function Home() {
  // ... (all fetching logic remains same)
  let featuredProducts: StorefrontProduct[] = [];
  let newArrivals: StorefrontProduct[] = [];
  let bestSellers: StorefrontProduct[] = [];
  let categories: Category[] = [];
  let testimonials: Testimonial[] = [];
  let customerPhotos: CustomerPhoto[] = [];
  let flashSaleProducts: StorefrontProduct[] = [];
  let storeFeatures: StoreFeature[] = [];
  let productCollections: ProductCollection[] = [];

  let landingConfig;
  let pageSettings: SettingsMap | null = null; // Still any but we'll try to refine if we find the type

  try {
    const configPromise = getLandingConfig();
    
    const results = await Promise.all([
      getFeaturedProducts(),
      getNewArrivals(),
      getBestSellers(),
      getCategories(),
      getSettings(),
      getFeaturedReviews(),
      getActiveCustomerPhotos(),
      getActiveStoreFeatures(),
      getActiveCollections(),
    ]);

    const productsResult = results[0];
    const newArrivalsResult = results[1];
    const bestSellersResult = results[2];
    const categoriesResult = results[3];
    pageSettings = results[4] as SettingsMap;
    const featuredReviewsResult = results[5];
    const activePhotosResult = results[6];
    const activeFeaturesResult = results[7];
    const activeCollectionsResult = results[8];

    try {
      landingConfig = await configPromise;
    } catch (e) {
      console.error("Error loading landing config", e);
    }

    if (productsResult.success && productsResult.data) featuredProducts = productsResult.data;

    if (landingConfig) {
      if (landingConfig.manualNewArrivalIds?.length > 0) {
        const manual = await getProductsByIds(landingConfig.manualNewArrivalIds);
        if (manual.success && manual.data) newArrivals = manual.data;
      } else if (newArrivalsResult.success && newArrivalsResult.data) {
        newArrivals = newArrivalsResult.data;
      }

      if (landingConfig.manualBestSellerIds?.length > 0) {
        const manual = await getProductsByIds(landingConfig.manualBestSellerIds);
        if (manual.success && manual.data) bestSellers = manual.data;
      } else if (bestSellersResult.success && bestSellersResult.data) {
        bestSellers = bestSellersResult.data;
      }

      if (landingConfig.manualFlashSaleIds?.length > 0) {
        const { data } = await getProductsByIds(landingConfig.manualFlashSaleIds);
        if (data) flashSaleProducts = data;
      } else if (landingConfig.manualFlashSaleId) {
        const { data } = await getProductsByIds([landingConfig.manualFlashSaleId]);
        if (data) flashSaleProducts = data;
      }
      
      if (flashSaleProducts.length === 0) flashSaleProducts = featuredProducts;
    } else {
      flashSaleProducts = featuredProducts;
      if (newArrivalsResult.success && newArrivalsResult.data) newArrivals = newArrivalsResult.data;
      if (bestSellersResult.success && bestSellersResult.data) bestSellers = bestSellersResult.data;
    }

    if (categoriesResult.success && categoriesResult.data) categories = categoriesResult.data as Category[];

    if (featuredReviewsResult.success && featuredReviewsResult.data) {
        testimonials = featuredReviewsResult.data.map((r: { 
          id: string; 
          customerName: string; 
          customerRoleAr: string | null; 
          customerRoleEn: string | null; 
          commentAr: string | null; 
          commentEn: string | null; 
          comment: string | null; 
          customerImage: string | null; 
          rating: number 
        }) => ({
            id: r.id,
            nameAr: r.customerName,
            nameEn: r.customerName,
            roleAr: r.customerRoleAr || "",
            roleEn: r.customerRoleEn || "",
            textAr: r.commentAr || r.comment || "",
            textEn: r.commentEn || r.comment || "",
            image: r.customerImage || null,
            rating: r.rating
        }));
    }

    if (activePhotosResult.success && activePhotosResult.data) customerPhotos = activePhotosResult.data;
    if (activeFeaturesResult.success && activeFeaturesResult.data) storeFeatures = activeFeaturesResult.data;

    if (activeCollectionsResult.success && activeCollectionsResult.data) {
        productCollections = activeCollectionsResult.data.map((collection) => ({
            id: collection.id,
            titleAr: collection.titleAr,
            titleEn: collection.titleEn,
            products: collection.items.map((item) => item.product)
        }));
    }

  } catch (e) {
    console.error("Error loading main page data", e);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "name": pageSettings?.storeNameEn || "New Concept",
    "image": "https://res.cloudinary.com/dxgvn3gad/image/upload/v1771868786/furniture_store/o62wzklmikhx7evkoeyf.webp",
    "description": pageSettings?.descriptionEn || "Luxury furniture store in Saudi Arabia.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Jeddah",
      "addressCountry": "SA",
      "streetAddress": pageSettings?.storeAddressEn || ""
    },
    "telephone": pageSettings?.storePhone || "+966570581224",
    "priceRange": "$$$"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient 
        newArrivals={newArrivals}
        bestSellers={bestSellers}
        flashSaleProducts={flashSaleProducts}
        categories={categories}
        testimonials={testimonials}
        customerPhotos={customerPhotos}
        storeFeatures={storeFeatures}
        landingConfig={landingConfig}
        dynamicCollections={productCollections}
        locationSettings={{
          mapCoordinates: pageSettings?.mapCoordinates,
          googleMapsUrl: pageSettings?.googleMapsUrl,
          addressEn: pageSettings?.storeAddressEn,
          addressAr: pageSettings?.storeAddressAr,
        }}
      />
    </>
  );
}
