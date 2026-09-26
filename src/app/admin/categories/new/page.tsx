import { getAllCategoriesForSelect, getMaxSortOrder } from "@/actions/category";
import { CategoryForm } from "@/components/admin/CategoryForm";
import NextLink from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const [categoriesResult, sortOrderResult] = await Promise.all([
    getAllCategoriesForSelect(),
    getMaxSortOrder(),
  ]);

  const categories = categoriesResult.success ? categoriesResult.data || [] : [];
  const defaultSortOrder = sortOrderResult.success ? sortOrderResult.data ?? 0 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Breadcrumb */}
      <div className="space-y-4">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
          <NextLink
            href="/admin/categories"
            className="hover:text-primary transition-colors"
          >
            Categories
          </NextLink>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-900">Add New</span>
        </nav>

        <div className="flex items-center gap-4">
          <NextLink
            href="/admin/categories"
            className="h-10 w-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-600" />
          </NextLink>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 font-playfair">
              Add New Category
            </h1>
            <p className="text-neutral-500 mt-1">
              Create a new collection to organize your catalog.
            </p>
          </div>
        </div>
      </div>

      <CategoryForm
        categories={categories}
        defaultSortOrder={defaultSortOrder}
      />
    </div>
  );
}
