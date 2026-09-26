import { prisma } from "@/lib/db";
import { PortfolioManagementClient } from "@/components/admin/PortfolioManagementClient";
import { getPortfolioConfig } from "@/actions/portfolio-config";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioCategoriesPage() {
  const [categories, configResult] = await Promise.all([
    prisma.portfolioCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { items: true },
        },
      },
    }),
    getPortfolioConfig(),
  ]);

  const rawConfig = configResult.success ? configResult.data : null;
  const config = rawConfig
    ? {
        heroTitleAr: rawConfig.heroTitleAr ?? undefined,
        heroTitleEn: rawConfig.heroTitleEn ?? undefined,
        heroDescAr: rawConfig.heroDescAr ?? undefined,
        heroDescEn: rawConfig.heroDescEn ?? undefined,
        showStats: rawConfig.showStats ?? undefined,
        stats: rawConfig.stats as string | undefined,
      }
    : null;

  return <PortfolioManagementClient categories={categories} config={config} />;
}
