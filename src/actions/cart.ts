"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getOrCreateCartId(): Promise<string> {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("cartId")?.value;

  if (!cartId) {
    const cart = await prisma.cart.create({
      data: { sessionId: crypto.randomUUID() },
    });
    cartId = cart.id; // Using DB ID as the cookie value for simplicity in this flow, or map sessionId
    // In a real app, you might want to sign this or use session IDs.
    // Here we'll align: Cookie Stores the SessionID or CartID?
    // Schema says sessionId is unique. Let's use sessionId for the cookie.

    // Correction: Let's store the sessionId in the cookie.
    const sessionId = cart.sessionId;
    cookieStore.set("cartId", sessionId); // Renaming cookie to 'cartSessionId' would be better but sticking to logic
    return sessionId;
  }
  return cartId;
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
      cookieStore.set("cartSessionId", sessionId);
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
        variantId,
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
          variantId,
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

import { getLandingConfig } from "@/actions/landing";

// ...

export async function getCart() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("cartSessionId")?.value;

  if (!sessionId) return null;

  const [cart, landingConfig] = await Promise.all([
    prisma.cart.findUnique({
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
                sizeNameAr: true,
                sizeNameEn: true,
                colorAr: true,
                colorEn: true,
                price: true,
                discountPrice: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    getLandingConfig().catch(() => null),
  ]);

  if (!cart) return null;

  // Determine Flash Sale Status
  const now = new Date();
  const isFlashSaleActive =
    landingConfig?.showFlashSales &&
    landingConfig?.flashSaleEndDate &&
    now < new Date(landingConfig.flashSaleEndDate);

  const flashSaleDiscount = isFlashSaleActive
    ? landingConfig?.flashSaleDiscount || 0
    : 0;

  // Determine relevant product IDs for Flash Sale
  let flashSaleProductIds: string[] = [];
  if (isFlashSaleActive) {
    if (
      landingConfig?.manualFlashSaleIds &&
      landingConfig.manualFlashSaleIds.length > 0
    ) {
      flashSaleProductIds = landingConfig.manualFlashSaleIds;
    } else if (landingConfig?.manualFlashSaleId) {
      flashSaleProductIds = [landingConfig.manualFlashSaleId];
    }
  }

  // Calculate Totals and Update Items with correct price
  const itemsWithPrice = cart.items.map((item) => {
    const basePrice = Number(
      item.variant?.discountPrice ?? item.variant?.price ?? 0,
    );

    let finalPrice = basePrice;
    let isFlashSale = false;

    if (isFlashSaleActive) {
      // Check if item is in flash sale
      if (flashSaleProductIds.length > 0) {
        if (flashSaleProductIds.includes(item.product.id)) {
          isFlashSale = true;
        }
      } else {
        // Auto mode: Featured products are flash sale products
        if (item.product.isFeatured) {
          isFlashSale = true;
        }
      }
    }

    if (isFlashSale && flashSaleDiscount > 0) {
      finalPrice = basePrice * (1 - flashSaleDiscount / 100);
    }

    return {
      ...item,
      price: finalPrice, // Effective price for calculation
      isFlashSale,
      flashSaleDiscount: isFlashSale ? flashSaleDiscount : 0,
    };
  });

  const total = itemsWithPrice.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return { ...cart, items: itemsWithPrice, total };
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
