"use server";

import { revalidatePath, unstable_noStore } from "next/cache";

export type CustomerPhotoData = {
  id: string;
  image: string;
  altText: string | null;
  sortOrder: number;
  isActive: boolean;
};

const defaultNutPhotos: CustomerPhotoData[] = [
  {
    id: "photo-1",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=800&auto=format&fit=crop",
    altText: "مكسرات نَتس الفاخرة",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "photo-2",
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?q=80&w=800&auto=format&fit=crop",
    altText: "عين جمل طازج",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "photo-3",
    image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?q=80&w=800&auto=format&fit=crop",
    altText: "فستق حلبي محمص",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "photo-4",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?q=80&w=800&auto=format&fit=crop",
    altText: "لوز أمريكي محمص",
    sortOrder: 3,
    isActive: true,
  }
];

export async function getCustomerPhotos(): Promise<{ success: boolean; data?: CustomerPhotoData[]; error?: string }> {
  unstable_noStore();
  return { success: true, data: defaultNutPhotos };
}

export async function getActiveCustomerPhotos(): Promise<{ success: boolean; data?: CustomerPhotoData[]; error?: string }> {
  unstable_noStore();
  return { success: true, data: defaultNutPhotos };
}

export async function createCustomerPhoto(formData: FormData): Promise<{ success: boolean; data?: CustomerPhotoData; error?: string }> {
  revalidatePath("/");
  return { success: true, data: defaultNutPhotos[0] };
}

export async function deleteCustomerPhoto(id: string): Promise<{ success: boolean; error?: string }> {
  revalidatePath("/");
  return { success: true };
}

export async function reorderCustomerPhotos(
  items: { id: string; sortOrder: number }[],
): Promise<{ success: boolean; error?: string }> {
  revalidatePath("/");
  return { success: true };
}
