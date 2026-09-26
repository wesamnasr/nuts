import { getProducts, getFeaturedProducts, getBestSellers, getNewArrivals, getSpecialOffers } from "@/actions/product";
import { getCategories } from "@/actions/category";
import { getActiveCollections, getCollection } from "@/actions/collections";
import { getSettings, getLandingPageConfig } from "@/actions/settings";
import { ShopClient } from "@/components/ShopClient";
import { type StorefrontProduct } from "@/lib/transformers";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: `Shop | ${settings.storeNameEn || "Furniture Store"}`,
    description: "Browse our exclusive collection of luxury furniture.",
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string; collection?: string }>;
}) {

  const { sort, collection: collectionId, category, search } = await searchParams;

  // 1. Fetch dependencies (Categories, Collections)
  const [categoriesResult, collectionsResult, landingPageConfig] = await Promise.all([
    getCategories(),
    getActiveCollections(),
    getLandingPageConfig(),
  ]);

  // Resolve categoryId if category slug is present
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];
  const activeCategoryId = category && category !== 'all' 
    ? categories.find(c => c.slug === category)?.id 
    : undefined;

  // 1.5 Fetch Dynamic Lists with Filters
  const [featuredResult, bestSellersResult, newArrivalsResult, specialOffersResult] = await Promise.all([
    getFeaturedProducts({ 
      categoryId: activeCategoryId, 
      search, 
      limit: 100 
    }),
    getBestSellers({ 
      categoryId: activeCategoryId, 
      search, 
      limit: 100 
    }),
    getNewArrivals({ 
      categoryId: activeCategoryId, 
      search, 
      limit: 100 
    }),
    getSpecialOffers({ 
      categoryId: activeCategoryId, 
      search, 
      limit: 100 
    })
  ]);

  const featuredProducts = featuredResult.success ? featuredResult.data || [] : [];
  const bestSellers = bestSellersResult.success ? bestSellersResult.data || [] : [];
  const newArrivals = newArrivalsResult.success ? newArrivalsResult.data || [] : [];
  const specialOffers = specialOffersResult.success ? specialOffersResult.data || [] : [];

  // 2. Determine which products to fetch
  let products: StorefrontProduct[] = [];
  
  if (collectionId === 'special-offers') {
    products = specialOffers;
  } else if (collectionId === 'new-arrivals') {
    products = newArrivals;
  } else if (collectionId === 'best-sellers') {
    products = bestSellers;
  } else if (collectionId === 'featured') {
     products = featuredProducts;
  } else if (collectionId) {
    // A. Fetch from Collection (All items)
    const collectionResult = await getCollection(collectionId);
    if (collectionResult.success && collectionResult.data) {
      // For Custom collections, we also need to apply the dual filter (Category/Search)
      // Since getCollection returns ALL items, we must filter in memory here.
      let items = collectionResult.data.items.map((item: any) => item.product);

      if (activeCategoryId) {
        items = items.filter((p: any) => p.categoryId === activeCategoryId);
      }
      if (search) {
        const q = search.toLowerCase();
        items = items.filter((p: any) => 
          p.nameEn.toLowerCase().includes(q) || 
          p.nameAr.toLowerCase().includes(q)
        );
      }
      products = items;
    }
  } else {
    // B. Default Fetch (Standard Products)
    // Pass server-side filters for accurate results
    const productsResult = await getProducts({ 
      limit: 100,
      categoryId: activeCategoryId,
      search: search
    });
    products = productsResult.success ? productsResult.data?.products || [] : [];
  }

  // 3. Inject Dynamic Collections if they have products
  const dynamicCollections: { id: string; titleAr: string; titleEn: string }[] = [];
  
  if (specialOffers.length > 0) {
    dynamicCollections.push({
      id: "special-offers",
      titleEn: "Special Offers",
      titleAr: "عروض خاصة"
    });
  }

  if (newArrivals.length > 0) {
    dynamicCollections.push({
      id: "new-arrivals",
      titleEn: "New Arrivals",
      titleAr: "وصل حديثاً"
    });
  }

  if (bestSellers.length > 0) {
    dynamicCollections.push({
      id: "best-sellers",
      titleEn: "Best Sellers",
      titleAr: "الأكثر مبيعاً"
    });
  }

  if (featuredProducts.length > 0) {
    dynamicCollections.push({
      id: "featured",
      titleEn: "Featured",
      titleAr: "مميز"
    });
  }

  // Prepend dynamic collections and ensure type consistency
  // We map the DB collections to the simple interface expected by ShopClient
  // AND filter out empty collections
  const dbCollectionsRaw = collectionsResult.success ? collectionsResult.data || [] : [];
  const dbCollections = dbCollectionsRaw
    .filter((c: any) => c.items && c.items.length > 0)
    .map((c: any) => ({
      id: c.id,
      titleAr: c.titleAr,
      titleEn: c.titleEn
    }));

  const allCollections = [...dynamicCollections, ...dbCollections];

  return (
    <ShopClient 
      key={`${category}-${search}-${sort}-${collectionId}`}
      initialProducts={products} 
      categories={categories} 
      collections={allCollections}
      initialSortBy={sort}
      activeCollectionId={collectionId}
      flashSaleEndDate={landingPageConfig?.flashSaleEndDate || undefined}
    />
  );
}
