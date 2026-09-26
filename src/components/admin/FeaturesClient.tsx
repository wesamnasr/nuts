"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import NextLink from "next/link";
import { StoreFeatureList } from "@/components/admin/StoreFeatureList";
import { useLocale } from "@/i18n/LocaleContext";

import type { StoreFeature } from "@prisma/client";

interface FeaturesClientProps {
  features: StoreFeature[];
}

export function FeaturesClient({ features }: FeaturesClientProps) {
  const { t } = useLocale();

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 font-playfair">
            {t("featuresTitle")}
          </h1>
          <p className="text-neutral-500 text-xs sm:text-base">
            {t("featuresSubtitle").replace("{count}", features.length.toString())}
          </p>
        </div>
        <NextLink href="/admin/features/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto gap-2 bg-[#d8a868] hover:bg-[#c6975a] shadow-lg shadow-primary/20 rounded-xl h-12 sm:h-11 px-6 font-bold">
            <Plus className="w-5 h-5 sm:w-4 sm:h-4" /> 
            {t("addFeature")}
          </Button>
        </NextLink>
      </div>

      <StoreFeatureList initialFeatures={features} />
    </div>
  );
}
