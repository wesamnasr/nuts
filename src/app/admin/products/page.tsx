import { getProducts } from "@/actions/product";
import { ProductsClient } from "@/components/admin/ProductsClient";

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    categoryId?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const categoryId = params.categoryId;

  const { data } = await getProducts({
    page,
    search,
    categoryId,
    limit: 10,
    includeHidden: true,
  });

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <ProductsClient 
      products={products} 
      total={total} 
      totalPages={totalPages} 
      page={page} 
    />
  );
}



