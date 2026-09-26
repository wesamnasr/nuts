import { PortfolioItemForm } from "@/components/admin/PortfolioItemForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewPortfolioItemPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-2xl font-bold mb-8">Add New Portfolio Item</h1>
      <PortfolioItemForm categoryId={id} />
    </div>
  );
}
