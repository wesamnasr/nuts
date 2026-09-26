import { notFound } from "next/navigation";
import { getAllCategoriesForSelect, getCategoryById } from "@/actions/category";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const dynamic = "force-dynamic";

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;

  // Fetch category data and all categories (for parent selection)
  const [categoryResult, categoriesResult] = await Promise.all([
    getCategoryById(id),
    getAllCategoriesForSelect(),
  ]);

  if (!categoryResult.success || !categoryResult.data) {
    notFound();
  }

  const category = categoryResult.data;
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Edit Category</h1>
        <p className="text-neutral-500 mt-2">
          Update category details, hierarchy and visibility
        </p>
      </div>

      <CategoryForm
        categories={categories}
        defaultSortOrder={0} // Not used when editing
        initialData={{
          id: category.id,
          nameEn: category.nameEn,
          nameAr: category.nameAr,
          slug: category.slug,
          parentId: category.parentId,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
          image: category.image || null,
        }}
      />
    </div>
  );
}
