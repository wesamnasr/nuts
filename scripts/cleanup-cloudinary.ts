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
        .replace(/^["']|["']$/g, ""); // Remove quotes if present
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
}

// Configure Cloudinary (Make sure env vars are loaded)
cloudinary.config({
  cloud_name: process.env.UPLOADS_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.UPLOADS_CLOUDINARY_API_KEY,
  api_secret: process.env.UPLOADS_CLOUDINARY_API_SECRET,
  secure: true,
});

// Initialize Prisma
const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function extractPublicId(url: string | null): string | null {
  if (!url) return null;
  if (!url.includes("cloudinary.com")) return null;

  try {
    // Example: https://res.cloudinary.com/cloudname/image/upload/v123456789/folder/image.jpg
    // Regex matches content after /v\d+/ and before the extension
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    // Fallback: split by slash and remove extension
    const parts = url.split("/");
    const filename = parts.pop();
    const folder = parts.slice(parts.indexOf("upload") + 2).join("/"); // +2 to skip 'upload' and 'v123...'
    if (filename) {
      const publicId = filename.split(".")[0];
      return folder ? `${folder}/${publicId}` : publicId;
    }
  } catch (error) {
    console.error(`Error extracting public ID from URL: ${url}`, error);
  }
  return null;
}

async function getAllDatabasePublicIds(): Promise<Set<string>> {
  const publicIds = new Set<string>();

  console.log("Fetching database records...");

  // Debug: Log active models on prisma client
  // Accessing seemingly private property to list models or just keys
  console.log(
    "Available Prisma models:",
    Object.keys(prisma).filter(
      (key) => key !== "_engine" && key !== "_clientEngineType",
    ),
  );

  // 1. Product Images
  if (prisma.productImage) {
    const productImages = await prisma.productImage.findMany({
      select: { url: true, publicId: true },
    });
    productImages.forEach((img) => {
      if (img.publicId) publicIds.add(img.publicId);
      else {
        const id = extractPublicId(img.url);
        if (id) publicIds.add(id);
      }
    });
  } else {
    console.warn("Model ProductImage not found on prisma instance");
  }

  // 2. Categories
  if (prisma.category) {
    const categories = await prisma.category.findMany({
      select: { image: true },
    });
    categories.forEach((c) => {
      const id = extractPublicId(c.image);
      if (id) publicIds.add(id);
    });
  } else {
    console.warn("Model Category not found on prisma instance");
  }

  // 3. Testimonials - Removed as table appears to be dropped in recent migrations

  // 4. Customer Photos
  // @ts-ignore
  if (prisma.customerPhoto) {
    // @ts-ignore
    const customerPhotos = await prisma.customerPhoto.findMany({
      select: { image: true },
    });
    customerPhotos.forEach((p: any) => {
      const id = extractPublicId(p.image);
      if (id) publicIds.add(id);
    });
  } else {
    console.warn("Model CustomerPhoto not found on prisma instance");
  }

  // 5. Store Features
  // @ts-ignore
  if (prisma.storeFeature) {
    // @ts-ignore
    const storeFeatures = await prisma.storeFeature.findMany({
      select: { icon: true },
    });
    storeFeatures.forEach((f: any) => {
      const id = extractPublicId(f.icon);
      if (id) publicIds.add(id);
    });
  } else {
    console.warn("Model StoreFeature not found on prisma instance");
  }

  // 6. Landing Page Config
  if (prisma.landingPageConfig) {
    const landingPages = await prisma.landingPageConfig.findMany({
      select: { heroImage: true },
    });
    landingPages.forEach((l) => {
      const id = extractPublicId(l.heroImage);
      if (id) publicIds.add(id);
    });
  } else {
    console.warn("Model LandingPageConfig not found on prisma instance");
  }

  // 7. Reviews
  if (prisma.review) {
    const reviews = await prisma.review.findMany({
      select: { customerImage: true },
    });
    reviews.forEach((r) => {
      const id = extractPublicId(r.customerImage);
      if (id) publicIds.add(id);
    });
  } else {
    console.warn("Model Review not found on prisma instance");
  }

  console.log(`Found ${publicIds.size} unique images used in the database.`);
  return publicIds;
}

async function getAllCloudinaryResources(): Promise<{ public_id: string }[]> {
  let resources: { public_id: string }[] = [];
  let nextCursor = null;

  console.log("Fetching Cloudinary resources...");

  do {
    const result = (await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      max_results: 500,
      next_cursor: nextCursor,
    })) as any;

    resources = resources.concat(result.resources);
    nextCursor = result.next_cursor;
    console.log(`Fetched ${resources.length} resources...`);
  } while (nextCursor);

  return resources;
}

async function cleanup() {
  try {
    const usedPublicIds = await getAllDatabasePublicIds();
    const allCloudinaryResources = await getAllCloudinaryResources();

    const unusedImages = allCloudinaryResources.filter(
      (resource) => !usedPublicIds.has(resource.public_id),
    );

    console.log(`Found ${unusedImages.length} unused images in Cloudinary.`);

    if (unusedImages.length === 0) {
      console.log("No images to delete.");
      return;
    }

    const unusedPublicIds = unusedImages.map((img) => img.public_id);

    // Batch delete (max 100 per request usually, but let's do chunks of 50 for safety)
    const chunkSize = 50;
    for (let i = 0; i < unusedPublicIds.length; i += chunkSize) {
      const chunk = unusedPublicIds.slice(i, i + chunkSize);
      console.log(
        `Deleting chunk ${Math.floor(i / chunkSize) + 1}... (${chunk.length} images)`,
      );

      const result = await cloudinary.api.delete_resources(chunk);
      console.log("Deleted:", result);
    }

    console.log("Cleanup complete!");
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
