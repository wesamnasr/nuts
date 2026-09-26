import { getPortfolioCategories } from "@/actions/portfolio";
import { getPortfolioConfig, type PortfolioStat } from "@/actions/portfolio-config";
import { PortfolioScrollLayout } from "@/components/portfolio/PortfolioScrollLayout";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { PortfolioStats } from "@/components/portfolio/PortfolioStats";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Works | معرض أعمالنا",
  description: "Explore our latest furniture designs and installations. تصفح أحدث تصميماتنا وأعمالنا في المفروشات.",
};

export default async function WorksPage() {
  const [categoriesResult, configResult] = await Promise.all([
    getPortfolioCategories(),
    getPortfolioConfig(),
  ]);

  const config = configResult.success ? configResult.data : null;

  const { data: categories, success } = categoriesResult;

  if (!success || !categories) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-neutral-500">Failed to load portfolio items.</p>
      </div>
    );
  }

  const stats = (config?.stats as unknown as PortfolioStat[]) || [];

  return (
    <div>
      <PortfolioHero 
        heroTitleAr={config?.heroTitleAr || ""}
        heroTitleEn={config?.heroTitleEn || ""}
        heroDescAr={config?.heroDescAr || ""}
        heroDescEn={config?.heroDescEn || ""}
      />
      
      {config && config.showStats !== false && (
        <PortfolioStats stats={stats} />
      )}

      <PortfolioScrollLayout categories={categories} />
    </div>
  );
}
