import { getCategories } from "@/actions/category";
import { ProductForm } from "@/components/admin/ProductForm";
import NextLink from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewProductPage() {
  const categoriesResult = await getCategories();
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Breadcrumb */}
      <div className="space-y-4">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
          <NextLink href="/admin/products" className="hover:text-primary transition-colors">
            Products
          </NextLink>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-900">Add New</span>
        </nav>
        
        <div className="flex items-center gap-4">
          <NextLink 
            href="/admin/products" 
            className="h-10 w-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-600" />
          </NextLink>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 font-playfair">Add New Product</h1>
            <p className="text-neutral-500 mt-1">Create a new furniture masterpiece in your catalog.</p>
          </div>
        </div>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
