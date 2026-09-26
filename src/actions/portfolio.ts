"use server";

export type MediaType = "IMAGE" | "VIDEO";
export const MediaType = { IMAGE: "IMAGE" as const, VIDEO: "VIDEO" as const };

export type PortfolioCategory = {
  id: string;
  nameAr?: string;
  nameEn?: string;
  titleAr?: string | null;
  titleEn?: string | null;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
  accentColor?: string | null;
  fontFamily?: string | null;
  coverImage?: string | null;
  logo?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  [key: string]: any;
};

export type PortfolioItem = {
  id: string;
  categoryId?: string;
  titleAr?: string | null;
  titleEn?: string | null;
  mediaUrl?: string;
  mediaType?: MediaType;
  sortOrder?: number;
  isActive?: boolean;
  publicId?: string | null;
  thumbnailUrl?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  whatsappMessage?: string | null;
  [key: string]: any;
};

export type PortfolioCategoryWithItems = PortfolioCategory & {
  items: PortfolioItem[];
};

export type PortfolioActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getPortfolioCategories(): Promise<PortfolioActionResponse<PortfolioCategoryWithItems[]>> {
  return { success: true, data: [] };
}

export async function createPortfolioCategory(data: any): Promise<PortfolioActionResponse> {
  return { success: true, data: { id: "cat-1", ...data } };
}

export async function updatePortfolioCategory(id: string, data: any): Promise<PortfolioActionResponse> {
  return { success: true, data: { id, ...data } };
}

export async function deletePortfolioCategory(id: string): Promise<PortfolioActionResponse> {
  return { success: true };
}

export async function reorderPortfolioCategories(items: any[]): Promise<PortfolioActionResponse> {
  return { success: true };
}

export async function createPortfolioItem(data: any): Promise<PortfolioActionResponse> {
  return { success: true, data: { id: "item-1", ...data } };
}

export async function updatePortfolioItem(id: string, data: any): Promise<PortfolioActionResponse> {
  return { success: true, data: { id, ...data } };
}

export async function deletePortfolioItem(id: string): Promise<PortfolioActionResponse> {
  return { success: true };
}

export async function reorderPortfolioItems(items: any[]): Promise<PortfolioActionResponse> {
  return { success: true };
}

export async function uploadPortfolioMedia(formData: FormData): Promise<PortfolioActionResponse<{ url: string; resourceType: string; publicId?: string; thumbnailUrl?: string }>> {
  return { success: true, data: { url: "", resourceType: "image", publicId: "", thumbnailUrl: "" } };
}
