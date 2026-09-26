"use client";

import { useOptimistic, useTransition, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  MoreVertical,
  Edit,
  Copy,
  Eye,
  Image as ImageIcon,
  Star,
  Search,
  ChevronRight,
  ChevronLeft,
  Trash,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toggleProductStatus, toggleProductFeatured, duplicateProduct, deleteProduct } from "@/actions/product";
import { toast } from "sonner";
import NextLink from "next/link";
import { useDebouncedCallback } from "use-debounce";
import { Price } from "@/components/ui/Price";
import { useLocale } from "@/i18n/LocaleContext";

interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  categoryId: string;
  isVisible: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  startingPrice: number;
  images: { url: string; altText: string | null }[];
  category: { id: string; nameEn: string; nameAr: string };
  updatedAt: Date;
  _count?: { images: number };
}

interface ProductDataTableProps {
  initialProducts: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export function ProductDataTable({
  initialProducts,
  total,
  totalPages,
  currentPage
}: ProductDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const { t, locale, dir } = useLocale();
   const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isRtl = dir === "rtl";

  // Optimistic State for immediate UI feedback
  const [optimisticProducts, addOptimisticProduct] = useOptimistic(
    initialProducts,
    (state, updatedProduct: Partial<Product>) => {
      return state.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p));
    }
  );

  // Search Handler
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to page 1
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  // Page Handler
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Actions
  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      addOptimisticProduct({ id, isVisible: !currentStatus });
      try {
        const result = await toggleProductStatus(id, !currentStatus);
        if (!result.success) throw new Error(result.error);
        toast.success(currentStatus ? t("productHidden") : t("productVisible"));
      } catch {
        toast.error(t("failedToUpdateStatus"));
      }
    });
  };

  const handleToggleFeatured = (id: string, currentFeatured: boolean) => {
    startTransition(async () => {
      addOptimisticProduct({ id, isFeatured: !currentFeatured });
      try {
        const result = await toggleProductFeatured(id, !currentFeatured);
        if (!result.success) throw new Error(result.error);
        toast.success(currentFeatured ? t("removedFromFeatured") : t("addedToFeatured"));
      } catch {
        toast.error(t("failedToUpdateStatus"));
      }
    });
  };

  const handleDuplicate = async (id: string) => {
    toast.promise(duplicateProduct(id), {
      loading: t("duplicatingProduct"),
      success: t("productDuplicated"),
      error: t("failedToDuplicate"),
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("deleteProductConfirm"))) return;

    startTransition(async () => {
      try {
        const result = await deleteProduct(id);
        if (result.success) {
          toast.success(t("productDeleted"));
          router.refresh();
        } else {
          toast.error(result.error || t("failedToDeleteProduct"));
        }
      } catch {
        toast.error(t("unexpectedError"));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center bg-white p-3 sm:p-4 rounded-2xl border shadow-sm">
        <div className="relative flex-1">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400",
            isRtl ? "right-3" : "left-3"
          )} />
          <Input
            placeholder={t("searchPlaceholder")}
            className={cn(
               "h-10 sm:h-11 rounded-xl border-neutral-100 focus-visible:ring-primary text-sm",
               isRtl ? "pr-10" : "pl-10"
            )}
            defaultValue={searchParams.get("search")?.toString()}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-500 bg-neutral-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border">
          <span className="font-bold text-neutral-900">{total}</span> {t("productsFound")}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
          <table className="min-w-[800px] w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-4 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider w-10">
                {t("columnNumber")}
              </th>
              <th className={cn(
                "px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider",
                isRtl ? "text-right" : "text-left"
              )}>{t("columnProduct")}</th>
              <th className={cn(
                "px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider",
                isRtl ? "text-right" : "text-left"
              )}>{t("columnPrice")}</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider">{t("columnStatus")}</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider">{t("columnFeatured")}</th>
              <th className={cn(
                "px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider",
                isRtl ? "text-left" : "text-right"
              )}>{t("columnActions")}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {mounted && optimisticProducts.map((product, index) => (
              <tr key={product.id} className="hover:bg-neutral-50 transition-colors group">
                {/* Row Number */}
                <td className="px-4 py-4 whitespace-nowrap text-center text-xs font-bold text-neutral-400 font-mono">
                  {((currentPage - 1) * 10) + index + 1}
                </td>
                {/* Product Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={locale === "ar" ? product.nameAr : product.nameEn}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-neutral-300" />
                        </div>
                      )}
                    </div>
                    <div className={isRtl ? "mr-4" : "ml-4"}>
                      <div className="text-sm font-bold text-neutral-900">{locale === "ar" ? product.nameAr : product.nameEn}</div>
                      <div className="text-xs text-neutral-500 font-cairo mb-1">{locale === "ar" ? product.nameEn : product.nameAr}</div>
                      <Badge variant="secondary" className="text-[10px] font-normal bg-neutral-100 text-neutral-600">
                        {locale === "ar" ? product.category.nameAr : product.category.nameEn}
                      </Badge>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <Price 
                      amount={product.startingPrice} 
                      className="text-sm font-bold text-neutral-900" 
                      iconClassName="w-4 h-4"
                    />
                    {product.isOnSale && (
                      <span className="text-xs text-primary font-medium">{t("onSale")}</span>
                    )}
                  </div>
                </td>

                {/* Visibility Toggle */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                   <div className="flex justify-center">
                    <Switch 
                      checked={product.isVisible} 
                      onCheckedChange={() => handleToggleStatus(product.id, product.isVisible)}
                    />
                  </div>
                </td>

                {/* Featured Toggle */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Button
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleToggleFeatured(product.id, product.isFeatured)}
                    className={`rounded-full hover:bg-yellow-50 ${product.isFeatured ? "text-yellow-400" : "text-neutral-300 hover:text-yellow-400"}`}
                  >
                    <Star className={`h-5 w-5 ${product.isFeatured ? "fill-current" : ""}`} />
                  </Button>
                </td>

                {/* Actions */}
                <td className={cn(
                  "px-6 py-4 whitespace-nowrap text-sm font-medium",
                  isRtl ? "text-left" : "text-right"
                )}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-900 rounded-lg">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRtl ? "start" : "end"} className="w-48 rounded-xl p-2 shadow-lg border-neutral-100">
                      <DropdownMenuLabel className="text-xs text-neutral-400 uppercase tracking-wider">{t("columnActions")}</DropdownMenuLabel>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <NextLink href={`/admin/products/${product.id}/edit`}>
                          <Edit className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} /> {t("editDetails")}
                        </NextLink>
                      </DropdownMenuItem>
                       <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <NextLink href={`/admin/products/${product.id}/images`}>
                          <ImageIcon className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} /> {t("manageImages")}
                        </NextLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(product.id)} className="rounded-lg cursor-pointer">
                        <Copy className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} /> {t("duplicate")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-blue-600 focus:text-blue-700 focus:bg-blue-50">
                        <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer">
                          <Eye className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} /> {t("viewOnSite")}
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(product.id)}
                        className="rounded-lg cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                      >
                        <Trash className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} /> {t("deleteProduct")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            
            {optimisticProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-neutral-400">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-neutral-300" />
                    </div>
                    <p className="text-lg font-medium text-neutral-900">{t("noProductsFoundAdmin")}</p>
                    <p className="text-sm mt-1 mb-4">{t("noProductsFoundAdminDesc")}</p>
                    <Button asChild variant="outline" className="rounded-xl">
                      <NextLink href="/admin/products/new">{t("addNewProduct")}</NextLink>
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
          <Button 
            variant="outline" 
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="rounded-xl"
          >
            {isRtl ? <ChevronRight className="ml-2 h-4 w-4" /> : <ChevronLeft className="mr-2 h-4 w-4" />}
            {t("previous")}
          </Button>
          <span className="text-sm text-neutral-500 font-medium">
            {t("pageOf").replace("{current}", currentPage.toString()).replace("{total}", totalPages.toString())}
          </span>
          <Button 
            variant="outline" 
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="rounded-xl"
          >
            {t("next")}
            {isRtl ? <ChevronLeft className="mr-2 h-4 w-4" /> : <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
