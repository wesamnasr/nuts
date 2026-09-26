import { getProductReviews } from "@/actions/review";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { getProductBySlug, getProducts } from "@/actions/product";
import { getSettings, getPolicies } from "@/actions/settings";
import { getLandingConfig } from "@/actions/landing";
import { ProductContainer } from "@/components/product/ProductContainer";
import { SimilarProducts } from "@/components/product/SimilarProducts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlug(slug);
  if (!result.success || !result.data) return { title: "Product Not Found" };

  const product = result.data;
  return {
    title: `${product.nameEn} | ${product.nameAr}`,
    description: product.descEn || product.descAr || "",
    openGraph: {
      title: product.nameEn,
      description: product.descEn || "",
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Parallel data fetching for performance
  const [result, settings, policies, landingConfig] = await Promise.all([
    getProductBySlug(slug),
    getSettings(),
    getPolicies(),
    getLandingConfig(),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;
  const { data: similarProductsData } = await getProducts({
    categoryId: product.categoryId,
    excludeId: product.id,
    limit: 8,
  });
  const { data: reviews = [] } = await getProductReviews(product.id);
  const formattedPolicies = policies;
  const storeName = {
    en: settings.storeNameEn || "New Concept",
    ar: settings.storeNameAr || "نيو كونسبت",
  };
  const salesNumber = settings.salesNumber || settings.whatsappNumber || "+966500000000";
  const installmentFromSettings = {
    en: settings.installmentInfoEn || "",
    ar: settings.installmentInfoAr || "",
  };

  // Determine Flash Sale Status
  const now = new Date();
  const isFlashSaleActive = 
    landingConfig.showFlashSales &&
    landingConfig.flashSaleEndDate && 
    new Date(landingConfig.flashSaleEndDate) > now;
  
  const isProductInFlashSale = 
    isFlashSaleActive && 
    landingConfig.manualFlashSaleIds.includes(product.id);

  const flashSaleDiscount = isProductInFlashSale ? (landingConfig.flashSaleDiscount || 0) : 0;
  const flashSaleEndDate = isProductInFlashSale ? landingConfig.flashSaleEndDate : null;

  // JSON-LD Structured Data for SEO
  const defaultVariant =
    product.variants?.find((v: Record<string, unknown>) => v.isDefault) ||
    product.variants?.[0];
  const price = defaultVariant?.discountPrice
    ? Number(defaultVariant.discountPrice)
    : Number(defaultVariant?.price) || 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameEn,
    description: product.descEn,
    image:
      product.images?.map((img: Record<string, unknown>) => img.url) || [],
    sku: defaultVariant?.sku || product.slug,
    brand: {
      "@type": "Brand",
      name: storeName.en,
    },
    offers: {
      "@type": "Offer",
      price: price.toString(),
      priceCurrency: "SAR",
      availability:
        defaultVariant?.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/product/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pt-20">
          <ProductContainer
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            product={product as any}
            policies={formattedPolicies}
            salesNumber={salesNumber}
            storeName={storeName}
            installmentFromSettings={installmentFromSettings}
            flashSaleDiscount={flashSaleDiscount}
            flashSaleEndDate={flashSaleEndDate}
          />

          {/* Reviews Section */}
          <ReviewSection 
            productId={product.id} 
            initialReviews={reviews} 
          />

          {/* Similar Products */}
          <SimilarProducts 
            products={similarProductsData?.products || []}
            categoryId={product.categoryId} 
          />
      </div>
    </>
  );
}
