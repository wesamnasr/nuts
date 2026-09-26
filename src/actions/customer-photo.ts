"use server";

import { prisma } from "@/lib/db";
import { revalidatePath, unstable_noStore } from "next/cache";
import { put, del } from "@vercel/blob";
import { BLOB_TOKEN } from "@/lib/blob";

export type CustomerPhotoData = {
  image: string;
  altText?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

// GET: Fetch all customer photos (for admin)
export async function getCustomerPhotos() {
  unstable_noStore();
  try {
    const photos = await prisma.customerPhoto.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return { success: true, data: photos };
  } catch (error) {
    console.error("Error fetching customer photos:", error);
    return { success: false, error: "Failed to fetch customer photos" };
  }
}

// GET: Fetch active customer photos (for frontend)
export async function getActiveCustomerPhotos() {
  unstable_noStore();
  try {
    const photos = await prisma.customerPhoto.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return { success: true, data: photos };
  } catch (error) {
    console.error("Error fetching active customer photos:", error);
    return { success: false, error: "Failed to fetch customer photos" };
  }
}

// CREATE: Create a new customer photo
export async function createCustomerPhoto(formData: FormData) {
  try {
    const altText = formData.get("altText") as string;
    const sortOrder = Number(formData.get("sortOrder") || 0);
    const isActive = formData.get("isActive") === "true";
    const imageFile = formData.get("image") as File | null;

    if (!imageFile || imageFile.size === 0) {
      return { success: false, error: "Image is required" };
    }

    const blob = await put(`customer-photos/${imageFile.name}`, imageFile, {
      access: "public",
      addRandomSuffix: true,
      token: BLOB_TOKEN,
    });
    const imageUrl = blob.url;

    const photo = await prisma.customerPhoto.create({
      data: {
        image: imageUrl,
        altText,
        isActive,
        sortOrder,
      },
    });

    revalidatePath("/");
    revalidatePath("/", "layout");
    revalidatePath("/admin/customer-photos");
    return { success: true, data: photo };
  } catch (error) {
    console.error("Error creating customer photo:", error);
    return { success: false, error: "Failed to create customer photo" };
  }
}

// DELETE: Delete a customer photo
export async function deleteCustomerPhoto(id: string) {
  try {
    const photo = await prisma.customerPhoto.findUnique({
      where: { id },
    });
    if (photo?.image.includes("blob.vercel-storage.com")) {
      await del(photo.image, { token: BLOB_TOKEN });
    }
    await prisma.customerPhoto.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath("/", "layout");
    revalidatePath("/admin/customer-photos");
    return { success: true };
  } catch (error) {
    console.error("Error deleting customer photo:", error);
    return { success: false, error: "Failed to delete customer photo" };
  }
}

// REORDER: Update sort order of multiple photos
export async function reorderCustomerPhotos(
  items: { id: string; sortOrder: number }[],
) {
  try {
    const updates = items.map((item) =>
      prisma.customerPhoto.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    );
    await prisma.$transaction(updates);
    revalidatePath("/");
    revalidatePath("/", "layout");
    revalidatePath("/admin/customer-photos");
    return { success: true };
  } catch (error) {
    console.error("Error reordering customer photos:", error);
    return { success: false, error: "Failed to reorder customer photos" };
  }
}
