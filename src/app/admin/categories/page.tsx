import { prisma } from "@/lib/db";
import { CategoriesClient } from "@/components/admin/CategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: { where: { isDeleted: false } } }
      }
    },
    orderBy: { sortOrder: "asc" },
  });

  return <CategoriesClient categories={categories} />;
}
