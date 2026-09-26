"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";

export type CreateReviewData = {
  productId?: string;
  customerName: string;
  customerPhone?: string;
  customerRoleAr?: string;
  customerRoleEn?: string;
  customerImage?: string;
  rating: number;
  comment?: string;
  commentAr?: string;
  commentEn?: string;
  isFeatured?: boolean;
  isApproved?: boolean;
};

export async function createReview(data: CreateReviewData) {
  try {
    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerRoleAr: data.customerRoleAr,
        customerRoleEn: data.customerRoleEn,
        customerImage: data.customerImage,
        rating: data.rating,
        comment: data.comment,
        commentAr: data.commentAr,
        commentEn: data.commentEn,
        isFeatured: data.isFeatured || false,
        isApproved: data.isApproved || false, // Moderation required by default
      },
    });

    revalidatePath("/admin/reviews");
    revalidatePath("/");
    return { success: true, data: review };
  } catch (error) {
    console.error("Error creating review:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

export async function getReviews(
  status: "pending" | "approved" | "featured" | "all" = "all",
) {
  try {
    const where: any = {};
    if (status === "pending") where.isApproved = false;
    else if (status === "approved") where.isApproved = true;
    else if (status === "featured") where.isFeatured = true;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        product: {
          select: {
            nameAr: true,
            nameEn: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: reviews };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { success: false, error: "Failed to fetch reviews" };
  }
}

export async function updateReviewStatus(id: string, isApproved: boolean) {
  try {
    const review = await prisma.review.update({
      where: { id },
      data: { isApproved },
      include: { product: true },
    });

    revalidatePath("/admin/reviews");
    if (review.productId) {
      revalidatePath(`/product/${review.product?.slug}`);
    }
    revalidatePath("/");

    return { success: true, data: review };
  } catch (error) {
    console.error("Error updating review status:", error);
    return { success: false, error: "Failed to update review" };
  }
}

export async function toggleReviewFeatured(id: string, isFeatured: boolean) {
  try {
    const review = await prisma.review.update({
      where: { id },
      data: { isFeatured },
    });

    revalidatePath("/admin/reviews");
    revalidatePath("/");

    return { success: true, data: review };
  } catch (error) {
    console.error("Error toggling review featured status:", error);
    return { success: false, error: "Failed to update review feature status" };
  }
}

export async function deleteReview(id: string) {
  try {
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (review?.customerImage?.includes("blob.vercel-storage.com")) {
      try {
        await del(review.customerImage);
      } catch (e) {
        console.error("Failed to delete review image:", e);
      }
    }

    await prisma.review.delete({
      where: { id },
    });

    revalidatePath("/admin/reviews");
    revalidatePath("/");

    return { success: true, data: review };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, error: "Failed to delete review" };
  }
}

export async function getProductReviews(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: reviews };
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return { success: false, error: "Failed to fetch reviews" };
  }
}

export async function getFeaturedReviews() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        isApproved: true,
        isFeatured: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: reviews };
  } catch (error) {
    console.error("Error fetching featured reviews:", error);
    return { success: false, error: "Failed to fetch featured reviews" };
  }
}
