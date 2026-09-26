import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

// Manually load .env since dotenv is not available
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts
        .join("=")
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.UPLOADS_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.UPLOADS_CLOUDINARY_API_KEY,
  api_secret: process.env.UPLOADS_CLOUDINARY_API_SECRET,
  secure: true,
});

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function uploadToCloudinary(
  url: string,
  folder: string,
): Promise<{ secure_url: string; public_id: string } | null> {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: folder,
    });
    return { secure_url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    console.error(`Failed to upload ${url}:`, error);
    return null;
  }
}

async function main() {
  console.log("Starting migration of Unsplash images to Cloudinary...");

  // 1. Categories
  const categories = await prisma.category.findMany({
    where: { image: { startsWith: "https://images.unsplash.com" } },
  });
  console.log(`Found ${categories.length} categories to migrate.`);

  for (const cat of categories) {
    if (!cat.image) continue;
    console.log(`Uploading category image for: ${cat.nameEn}`);
    const upload = await uploadToCloudinary(cat.image, "furniture_categories");
    if (upload) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { image: upload.secure_url },
      });
    }
  }

  // 2. Product Images
  const productImages = await prisma.productImage.findMany({
    where: { url: { startsWith: "https://images.unsplash.com" } },
  });
  console.log(`Found ${productImages.length} product images to migrate.`);

  for (const img of productImages) {
    console.log(`Uploading product image ID: ${img.id}`);
    const upload = await uploadToCloudinary(img.url, "furniture_products");
    if (upload) {
      await prisma.productImage.update({
        where: { id: img.id },
        data: {
          url: upload.secure_url,
          publicId: upload.public_id,
        },
      });
    }
  }

  // 3. Reviews (Avatar images) - Optional but good for consistency
  if ((prisma as any).review) {
    const reviews = await (prisma as any).review.findMany({
      where: { customerImage: { startsWith: "https://i.pravatar.cc" } }, // Seed used pravatar
    });
    console.log(`Found ${reviews.length} reviews to migrate.`);

    for (const rev of reviews) {
      if (!rev.customerImage) continue;
      console.log(`Uploading review avatar for: ${rev.customerName}`);
      const upload = await uploadToCloudinary(
        rev.customerImage,
        "furniture_reviews",
      );
      if (upload) {
        await (prisma as any).review.update({
          where: { id: rev.id },
          data: { customerImage: upload.secure_url },
        });
      }
    }
  }

  console.log("Migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
