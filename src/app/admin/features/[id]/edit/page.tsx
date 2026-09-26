import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { StoreFeatureForm } from "@/components/admin/StoreFeatureForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStoreFeaturePage({ params }: PageProps) {
  const { id } = await params;
  
  const feature = await prisma.storeFeature.findUnique({
    where: { id },
  });

  if (!feature) {
    notFound();
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Edit Feature</h1>
        <p className="text-neutral-500 mt-2">
          Update feature details
        </p>
      </div>
      <StoreFeatureForm initialData={feature} />
    </div>
  );
}
