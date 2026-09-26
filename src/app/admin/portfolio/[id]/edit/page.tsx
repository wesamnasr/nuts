import { prisma } from "@/lib/db";
import { PortfolioCategoryForm } from "@/components/admin/PortfolioCategoryForm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPortfolioCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = await prisma.portfolioCategory.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-2xl font-bold mb-8">Edit Portfolio Category</h1>
      <PortfolioCategoryForm initialData={category} />
    </div>
  );
}
