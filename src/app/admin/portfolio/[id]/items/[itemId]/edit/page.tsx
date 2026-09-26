import { prisma } from "@/lib/db";
import { PortfolioItemForm } from "@/components/admin/PortfolioItemForm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ 
    id: string;      // categoryId
    itemId: string;  // itemId
  }>;
}

export default async function EditPortfolioItemPage({ params }: PageProps) {
  const { id, itemId } = await params;
  const item = await prisma.portfolioItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-2xl font-bold mb-8">Edit Portfolio Item</h1>
      <PortfolioItemForm categoryId={id} initialData={item} />
    </div>
  );
}
