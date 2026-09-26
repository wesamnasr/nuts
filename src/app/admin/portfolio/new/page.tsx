import { PortfolioCategoryForm } from "@/components/admin/PortfolioCategoryForm";

export default function NewPortfolioCategoryPage() {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-2xl font-bold mb-8">Add New Portfolio Category</h1>
      <PortfolioCategoryForm />
    </div>
  );
}
