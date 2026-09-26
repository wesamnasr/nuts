
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { put } from "@vercel/blob";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function migrateImage(url: string, path: string): Promise<string | null> {
  if (!url || (!url.includes("cloudinary.com") && !url.includes("res.cloudinary.com"))) {
    return null;
  }

  console.log(`Migrating: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = url.split("/").pop()?.split("?")[0] || "image.jpg";
    
    const { url: newUrl } = await put(`${path}/${filename}`, buffer, {
      access: "public",
    });

    console.log(`Success: ${newUrl}`);
    return newUrl;
  } catch (error) {
    console.error(`Error migrating ${url}:`, error);
    return null;
  }
}

async function main() {
  console.log("Starting Cloudinary to Vercel Blob migration...");

  // 1. Categories
  console.log("\n--- Migrating Categories ---");
  const categories = await prisma.category.findMany({
    where: { image: { contains: "cloudinary" } }
  });
  for (const cat of categories) {
    const newUrl = await migrateImage(cat.image!, `categories/${cat.slug}`);
    if (newUrl) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { image: newUrl }
      });
    }
  }

  // 2. Product Images
  console.log("\n--- Migrating Product Images ---");
  const productImages = await prisma.productImage.findMany({
    where: { url: { contains: "cloudinary" } },
    include: { product: true }
  });
  for (const img of productImages) {
    const newUrl = await migrateImage(img.url, `products/${img.product.slug}`);
    if (newUrl) {
      await prisma.productImage.update({
        where: { id: img.id },
        data: { url: newUrl, publicId: null }
      });
    }
  }

  // 3. Landing Page Config
  console.log("\n--- Migrating Landing Page ---");
  const configs = await prisma.landingPageConfig.findMany({
    where: { heroImage: { contains: "cloudinary" } }
  });
  for (const config of configs) {
    const newUrl = await migrateImage(config.heroImage, "landing");
    if (newUrl) {
      await prisma.landingPageConfig.update({
        where: { id: config.id },
        data: { heroImage: newUrl }
      });
    }
  }

  // 4. Customer Photos
  console.log("\n--- Migrating Customer Photos ---");
  const photos = await prisma.customerPhoto.findMany({
    where: { image: { contains: "cloudinary" } }
  });
  for (const photo of photos) {
    const newUrl = await migrateImage(photo.image, "customer-photos");
    if (newUrl) {
      await prisma.customerPhoto.update({
        where: { id: photo.id },
        data: { image: newUrl }
      });
    }
  }

  // 5. Store Features
  console.log("\n--- Migrating Store Features ---");
  const features = await prisma.storeFeature.findMany({
    where: { icon: { contains: "cloudinary" } }
  });
  for (const feature of features) {
    const newUrl = await migrateImage(feature.icon, "features");
    if (newUrl) {
      await prisma.storeFeature.update({
        where: { id: feature.id },
        data: { icon: newUrl }
      });
    }
  }

  // 6. Reviews
  console.log("\n--- Migrating Reviews ---");
  const reviews = await prisma.review.findMany({
    where: { customerImage: { contains: "cloudinary" } }
  });
  for (const review of reviews) {
    const newUrl = await migrateImage(review.customerImage!, "reviews");
    if (newUrl) {
      await prisma.review.update({
        where: { id: review.id },
        data: { customerImage: newUrl }
      });
    }
  }

  // 7. Portfolio Categories
  console.log("\n--- Migrating Portfolio Categories ---");
  const pCats = await prisma.portfolioCategory.findMany({
    where: {
      OR: [
        { logo: { contains: "cloudinary" } },
        { coverImage: { contains: "cloudinary" } }
      ]
    }
  });
  for (const cat of pCats) {
    const updateData: any = {};
    if (cat.logo?.includes("cloudinary")) {
      const newLogo = await migrateImage(cat.logo, `portfolio/categories/logo`);
      if (newLogo) updateData.logo = newLogo;
    }
    if (cat.coverImage?.includes("cloudinary")) {
      const newCover = await migrateImage(cat.coverImage, `portfolio/categories/cover`);
      if (newCover) updateData.coverImage = newCover;
    }
    if (Object.keys(updateData).length > 0) {
      await prisma.portfolioCategory.update({
        where: { id: cat.id },
        data: updateData
      });
    }
  }

  // 8. Portfolio Items
  console.log("\n--- Migrating Portfolio Items ---");
  const pItems = await prisma.portfolioItem.findMany({
    where: {
      OR: [
        { mediaUrl: { contains: "cloudinary" } },
        { thumbnailUrl: { contains: "cloudinary" } }
      ]
    }
  });
  for (const item of pItems) {
    const updateData: any = {};
    if (item.mediaUrl.includes("cloudinary")) {
      const newMedia = await migrateImage(item.mediaUrl, `portfolio/items`);
      if (newMedia) updateData.mediaUrl = newMedia;
    }
    if (item.thumbnailUrl?.includes("cloudinary")) {
      const newThumb = await migrateImage(item.thumbnailUrl, `portfolio/thumbnails`);
      if (newThumb) updateData.thumbnailUrl = newThumb;
    }
    if (Object.keys(updateData).length > 0) {
      await prisma.portfolioItem.update({
        where: { id: item.id },
        data: updateData
      });
    }
  }

  // 9. About Sections
  console.log("\n--- Migrating About Sections ---");
  const abouts = await prisma.aboutSection.findMany({
    where: { image: { contains: "cloudinary" } }
  });
  for (const about of abouts) {
    const newUrl = await migrateImage(about.image!, "about");
    if (newUrl) {
      await prisma.aboutSection.update({
        where: { id: about.id },
        data: { image: newUrl }
      });
    }
  }

  // 10. Settings (Store Logo)
  console.log("\n--- Migrating Settings ---");
  const settings = await prisma.setting.findMany({
    where: { value: { contains: "cloudinary" } }
  });
  for (const setting of settings) {
    const newUrl = await migrateImage(setting.value, "settings");
    if (newUrl) {
      await prisma.setting.update({
        where: { key: setting.key },
        data: { value: newUrl }
      });
    }
  }

  console.log("\nMigration completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
