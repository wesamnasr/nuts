-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONTACTED', 'COMPLETED', 'CANCELLED');
-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('SHIPPING', 'RETURN', 'INSTALLATION');
-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descAr" TEXT,
    "descEn" TEXT,
    "slug" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "materialAr" TEXT,
    "materialEn" TEXT,
    "madeInAr" TEXT,
    "madeInEn" TEXT,
    "warrantyAr" TEXT,
    "warrantyEn" TEXT,
    "installmentInfoAr" TEXT,
    "installmentInfoEn" TEXT,
    "deliveryInstallationAr" TEXT,
    "deliveryInstallationEn" TEXT,
    "recommendedSize" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "publicId" TEXT,
    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sizeNameAr" TEXT,
    "sizeNameEn" TEXT,
    "colorAr" TEXT,
    "colorEn" TEXT,
    "detailedSizeAr" TEXT,
    "detailedSizeEn" TEXT,
    "sku" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    "discountPrice" DECIMAL(10, 2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "WhatsAppOrder" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "message" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WhatsAppOrder_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "type" "PolicyType" NOT NULL,
    "contentAr" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);
-- CreateTable
CREATE TABLE "LandingPageConfig" (
    "id" TEXT NOT NULL,
    "heroTitleAr" TEXT NOT NULL,
    "heroTitleEn" TEXT NOT NULL,
    "heroSubtitleAr" TEXT NOT NULL,
    "heroSubtitleEn" TEXT NOT NULL,
    "heroImage" TEXT NOT NULL,
    "heroButtonTextAr" TEXT NOT NULL,
    "heroButtonTextEn" TEXT NOT NULL,
    "heroLink" TEXT NOT NULL,
    "showHero" BOOLEAN NOT NULL DEFAULT true,
    "showFeatures" BOOLEAN NOT NULL DEFAULT true,
    "showNewArrivals" BOOLEAN NOT NULL DEFAULT true,
    "showBestSellers" BOOLEAN NOT NULL DEFAULT true,
    "showFlashSales" BOOLEAN NOT NULL DEFAULT true,
    "showCategories" BOOLEAN NOT NULL DEFAULT true,
    "showTestimonials" BOOLEAN NOT NULL DEFAULT true,
    "showNewsletter" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "flashSaleEndDate" TIMESTAMP(3),
    "flashSalePrice" DECIMAL(10, 2),
    "manualBestSellerIds" TEXT [] DEFAULT ARRAY []::TEXT [],
    "manualFlashSaleId" TEXT,
    "manualNewArrivalIds" TEXT [] DEFAULT ARRAY []::TEXT [],
    "sectionsOrder" JSONB,
    CONSTRAINT "LandingPageConfig_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "roleAr" TEXT NOT NULL,
    "roleEn" TEXT NOT NULL,
    "textAr" TEXT NOT NULL,
    "textEn" TEXT NOT NULL,
    "image" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "CustomerPhoto" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomerPhoto_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");
-- CreateIndex
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");
-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");
-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
-- CreateIndex
CREATE INDEX "Product_isVisible_isFeatured_idx" ON "Product"("isVisible", "isFeatured");
-- CreateIndex
CREATE INDEX "Product_materialEn_idx" ON "Product"("materialEn");
-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");
-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");
-- CreateIndex
CREATE INDEX "ProductVariant_colorEn_idx" ON "ProductVariant"("colorEn");
-- CreateIndex
CREATE INDEX "WhatsAppOrder_productId_idx" ON "WhatsAppOrder"("productId");
-- CreateIndex
CREATE INDEX "WhatsAppOrder_customerPhone_idx" ON "WhatsAppOrder"("customerPhone");
-- CreateIndex
CREATE UNIQUE INDEX "Cart_sessionId_key" ON "Cart"("sessionId");
-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");
-- CreateIndex
CREATE UNIQUE INDEX "Policy_type_key" ON "Policy"("type");
-- AddForeignKey
ALTER TABLE "Category"
ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Product"
ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ProductImage"
ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ProductVariant"
ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "WhatsAppOrder"
ADD CONSTRAINT "WhatsAppOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "WhatsAppOrder"
ADD CONSTRAINT "WhatsAppOrder_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CartItem"
ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CartItem"
ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CartItem"
ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE
SET NULL ON UPDATE CASCADE;