import { notFound } from "next/navigation";
import { getProductById } from "@/actions/product";
import { getCategories } from "@/actions/category";
import { ProductForm } from "@/components/admin/ProductForm";
import { ChevronRight, Home, Package, Edit } from "lucide-react";
import Link from "next/link";
import { EditProductHeader } from "@/components/admin/EditProductHeader";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [productResult, categoriesResult] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!productResult.success || !productResult.data) {
    notFound();
  }

  const product = productResult.data;
  const categories = categoriesResult.data?.map(cat => ({
    id: cat.id,
    nameEn: cat.nameEn,
    nameAr: cat.nameAr
  })) || [];

  return (
    <div className="space-y-6 container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-neutral-500 font-medium overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/admin" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <Link href="/admin/products" className="hover:text-primary transition-colors flex items-center gap-1">
          <Package className="h-4 w-4" />
          Products
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="text-neutral-900 flex items-center gap-1">
          <Edit className="h-4 w-4" />
          Edit Product
        </span>
      </nav>

      <EditProductHeader 
        productNameEn={product.nameEn} 
        productNameAr={product.nameAr} 
      />

      <ProductForm 
        categories={categories} 
        initialData={product} 
      />
    </div>
  );
}
