import { prisma } from "@/lib/db";
import { PortfolioItemsClient } from "@/components/admin/PortfolioItemsClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminPortfolioItemsPage({ params }: PageProps) {
  const { id } = await params;
  const category = await prisma.portfolioCategory.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <PortfolioItemsClient 
        categoryId={category.id} 
        categoryTitle={category.titleEn} // Pass base title, client handles locale
        items={category.items} 
    />
  );
}
