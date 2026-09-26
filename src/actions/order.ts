"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";

export type OrderItemInput = {
  productId: string;
  variantId?: string;
  productNameAr: string;
  productNameEn: string;
  variantDetails?: string;
  unitPrice: number;
  quantity: number;
};

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  governorate: string;
  city: string;
  addressDetails: string;
  notes?: string;
  shippingZoneId?: string;
  shippingFee: number;
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  senderWallet?: string;
  receiptUrl?: string;
  items: OrderItemInput[];
};

/**
 * Fetch all available Egyptian shipping zones
 */
export async function getShippingZones() {
  try {
    const zones = await prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: { shippingFee: "asc" },
    });
    return { success: true, data: zones };
  } catch (error) {
    console.error("Error fetching shipping zones:", error);
    return { success: false, data: [] };
  }
}

/**
 * Create a new Egyptian order
 */
export async function createOrder(data: CreateOrderInput) {
  try {
    if (!data.customerName || !data.customerPhone || !data.governorate || !data.addressDetails) {
      return { success: false, error: "يرجى ملء جميع البيانات الأساسية والعنوان" };
    }

    if (!data.items || data.items.length === 0) {
      return { success: false, error: "السلة فارغة" };
    }

    const totalAmount = data.subtotal + data.shippingFee - (data.discountAmount || 0);

    // Generate unique order number (e.g. NUT-26-XXXX)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `NUT-${new Date().getFullYear().toString().slice(-2)}-${randomSuffix}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        governorate: data.governorate,
        city: data.city,
        addressDetails: data.addressDetails,
        notes: data.notes || null,
        shippingZoneId: data.shippingZoneId || null,
        shippingFee: data.shippingFee,
        subtotal: data.subtotal,
        discountAmount: data.discountAmount || 0,
        totalAmount,
        couponCode: data.couponCode || null,
        status: OrderStatus.PENDING,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            productNameAr: item.productNameAr,
            productNameEn: item.productNameEn,
            variantDetails: item.variantDetails || null,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            totalPrice: item.unitPrice * item.quantity,
          })),
        },
        payment: {
          create: {
            method: data.paymentMethod,
            amount: totalAmount,
            currency: "EGP",
            status:
              data.paymentMethod === PaymentMethod.INSTAPAY_MANUAL ||
              data.paymentMethod === PaymentMethod.VODAFONE_CASH_MANUAL
                ? PaymentStatus.PENDING_VERIFICATION
                : PaymentStatus.PENDING,
            receiptUrl: data.receiptUrl || null,
            senderWallet: data.senderWallet || null,
          },
        },
      },
      include: {
        items: true,
        payment: true,
      },
    });

    revalidatePath("/admin/orders");
    return { success: true, data: order };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "حدث خطأ أثناء حفظ الطلب" };
  }
}

/**
 * Get all orders for Admin with pagination and filters
 */
export async function getOrders(options?: {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const { status, page = 1, limit = 20, search } = options || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          payment: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    revalidatePath("/admin/orders");
    return { success: true, data: order };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

/**
 * Update payment status (e.g. approve manual receipt)
 */
export async function updatePaymentStatus(paymentId: string, status: PaymentStatus) {
  try {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        paidAt: status === PaymentStatus.COMPLETED ? new Date() : null,
      },
    });
    revalidatePath("/admin/orders");
    return { success: true, data: payment };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: "Failed to update payment status" };
  }
}
