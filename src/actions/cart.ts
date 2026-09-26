"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getOrCreateCartId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("cartSessionId")?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    await prisma.cart.create({
      data: { sessionId },
    });
    cookieStore.set("cartSessionId", sessionId, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }
  return sessionId;
}

export async function addToCart(
  productId: string,
  variantId?: string,
  quantity: number = 1,
) {
  try {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("cartSessionId")?.value;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      cookieStore.set("cartSessionId", sessionId, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    let cart = await prisma.cart.findUnique({ where: { sessionId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { sessionId } });
    }

    // Check if item exists
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
        },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("AddToCart Error:", error);
    return { success: false, error: "Failed to add to cart" };
  }
}

export async function getCart() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cartSessionId")?.value;

    if (!sessionId) return null;

    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                slug: true,
                images: { where: { isMain: true }, take: 1 },
                isFeatured: true,
              },
            },
            variant: {
              select: {
                id: true,
                weightGram: true,
                flavorAr: true,
                flavorEn: true,
                packageTypeAr: true,
                packageTypeEn: true,
                price: true,
                discountPrice: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!cart) return null;

    const itemsWithPrice = cart.items.map((item) => {
      const basePrice = Number(
        item.variant?.discountPrice ?? item.variant?.price ?? 0,
      );

      const weight = item.variant?.weightGram || 250;
      const sizeTextAr = weight >= 1000 ? `${weight / 1000} كجم` : `${weight} جم`;
      const sizeTextEn = weight >= 1000 ? `${weight / 1000}kg` : `${weight}g`;

      return {
        ...item,
        price: basePrice,
        sizeNameAr: sizeTextAr,
        sizeNameEn: sizeTextEn,
        colorAr: item.variant?.flavorAr || "",
        colorEn: item.variant?.flavorEn || "",
      };
    });

    const total = itemsWithPrice.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    return { ...cart, items: itemsWithPrice, total };
  } catch (error) {
    console.error("Error in getCart:", error);
    return null;
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }
    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update item" };
  }
}

export async function removeFromCart(itemId: string) {
  try {
    await prisma.cartItem.delete({ where: { id: itemId } });
    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to remove item" };
  }
}

export async function clearCart() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cartSessionId")?.value;
    if (!sessionId) return { success: true };

    const cart = await prisma.cart.findUnique({ where: { sessionId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to clear cart" };
  }
}
