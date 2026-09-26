"use client";

import { useLocale } from "@/i18n/LocaleContext";
import { CustomerPhotosManager } from "@/components/admin/CustomerPhotosManager";

interface CustomerPhotosClientProps {
  photos: {
    id: string;
    image: string;
    altText: string | null;
    sortOrder: number;
    isActive: boolean;
  }[];
}

export function CustomerPhotosClient({ photos }: CustomerPhotosClientProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 font-playfair">{t("customerPhotosTitle")}</h1>
          <p className="text-neutral-500 mt-1">{t("customerPhotosSubtitle")}</p>
        </div>
      </div>

      <CustomerPhotosManager photos={photos} />
    </div>
  );
}
