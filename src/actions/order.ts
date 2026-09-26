"use server";

import { prisma } from "@/lib/db";

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  productId: string;
  variantId?: string;
  message?: string;
};

export async function createWhatsAppOrder(data: CreateOrderInput) {
  try {
    const order = await prisma.whatsAppOrder.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        productId: data.productId,
        variantId: data.variantId,
        message: data.message,
        status: "PENDING",
      },
    });

    return { success: true, data: order };
  } catch (error) {
    console.error("Error creating WhatsApp Order:", error);
    // We intentionally don't block the user flow if logging fails,
    // but we return false to maybe log it client-side
    return { success: false, error: "Failed to log order" };
  }
}
