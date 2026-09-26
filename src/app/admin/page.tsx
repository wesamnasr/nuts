import { prisma } from "@/lib/db";
import { DashboardClient } from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let productCount = 0;
  let categoryCount = 0;
  let orderCount = 0;
  let policyCount = 0;
  let topProducts: { name: string; count: number }[] = [];
  let error: string | undefined = undefined;

  try {
    // Attempt to fetch stats independently to prevent one failure from crashing all
    const results = await Promise.allSettled([
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.category.count(),
      prisma.order.count(),
      prisma.shippingZone.count(),
      // Fetch top 5 ordered products by grouping OrderItems
      prisma.orderItem.groupBy({
        by: ['productId'],
        _count: {
          productId: true,
        },
        orderBy: {
          _count: {
            productId: 'desc',
          },
        },
        take: 5,
      })
    ]);

    productCount = results[0].status === 'fulfilled' ? results[0].value : 0;
    categoryCount = results[1].status === 'fulfilled' ? results[1].value : 0;
    orderCount = results[2].status === 'fulfilled' ? results[2].value : 0;
    policyCount = results[3].status === 'fulfilled' ? results[3].value : 0;
    
    // Process top products data
    if (results[4].status === 'fulfilled' && results[4].value.length > 0) {
      const topProductIds = results[4].value.map((p: any) => p.productId as string);
      
      // Fetch product details to get names
      const products = await prisma.product.findMany({
        where: {
          id: { in: topProductIds }
        },
        select: {
          id: true,
          nameAr: true,
          nameEn: true
        }
      });

      // Map the grouped counts with product names
      topProducts = results[4].value.map((group: any) => {
        const product = products.find(p => p.id === group.productId);
        // Safely extract count, Prisma types can be tricky with aggregations
        const countValue = group._count?.productId ? Number(group._count.productId) : 0;
        return {
          name: product?.nameAr || product?.nameEn || "منتج غير معروف",
          count: countValue
        };
      });
    }

    // Log errors if any
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Error fetching stat at index ${index}:`, result.reason);
        error = "Failed to load some dashboard stats. Please check logs.";
      }
    });

  } catch (e) {
    console.error("Critical error in AdminDashboardPage:", e);
    error = "A critical error occurred while loading the dashboard.";
  }

  return (
    <DashboardClient 
      stats={{
        productCount,
        categoryCount,
        orderCount,
        policyCount,
      }}
      topProducts={topProducts}
      error={error}
    />
  );
}
