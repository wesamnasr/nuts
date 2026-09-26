import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft, Camera, Image as ImageIcon, Star } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { deleteProductImage, setProductMainImage } from "@/actions/product";

interface ProductImagesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductImagesPage({ params }: ProductImagesPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) notFound();

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Button variant="ghost" asChild className="mb-4 -ml-4 text-neutral-400 hover:text-neutral-900">
            <NextLink href="/admin/products" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </NextLink>
          </Button>
          <h1 className="text-4xl font-bold text-neutral-900 font-playfair flex items-center gap-3">
            <Camera className="h-8 w-8 text-[#FF7F11]" />
            Manage Images
          </h1>
          <p className="text-neutral-500 mt-2 flex items-center gap-2">
            <span className="font-bold text-neutral-700">{product.nameEn}</span>
            <span className="text-neutral-300">|</span>
            <span className="font-cairo">{product.nameAr}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#FF7F11]" />
              Upload Photos
            </h2>
            <ImageUpload productId={product.id} />
            <div className="mt-6 p-4 bg-orange-50 rounded-2xl text-[11px] text-orange-700 leading-relaxed italic">
              Tip: The first image you upload will be set as the Main photo automatically if none exists.
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl border shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">
                Gallery <span className="text-neutral-300 font-light ml-2">({product.images.length})</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
              {product.images.map((image) => (
                <div key={image.id} className="group relative aspect-4/5 rounded-2xl border overflow-hidden bg-neutral-50 shadow-sm hover:shadow-md transition-all">
                  <Image
                    src={image.url}
                    alt={image.altText || "Product image"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {image.isMain && (
                    <span className="absolute top-3 left-3 bg-[#FF7F11] text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg">
                      MAIN
                    </span>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-3">
                    {!image.isMain && (
                      <form action={async () => {
                        "use server";
                        await setProductMainImage(image.id, product.id);
                      }}>
                        <Button variant="secondary" size="sm" type="submit" className="rounded-xl shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Set Main
                        </Button>
                      </form>
                    )}
                    <form action={async () => {
                      "use server";
                      await deleteProductImage(image.id);
                    }}>
                      <Button variant="destructive" size="icon" type="submit" className="rounded-xl h-12 w-12 shadow-xl hover:scale-110 transition-transform">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}

              {product.images.length === 0 && (
                <div className="col-span-full py-20 text-center text-neutral-300 border-2 border-dashed border-neutral-100 rounded-3xl">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">No images in gallery yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

