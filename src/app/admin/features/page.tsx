import { prisma } from "@/lib/db";
import { FeaturesClient } from "@/components/admin/FeaturesClient";

export const dynamic = "force-dynamic";

export default async function StoreFeaturesPage() {
  const features = await prisma.storeFeature.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return <FeaturesClient features={features} />;
}
