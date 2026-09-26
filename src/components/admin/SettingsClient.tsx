"use client";

import { SettingsForm } from "@/components/admin/SettingsForm";
import { useLocale } from "@/i18n/LocaleContext";
import type { SettingsMap, PolicyData } from "@/actions/settings";

interface SettingsClientProps {
  settings: SettingsMap;
  policies: PolicyData[];
}

export function SettingsClient({ settings, policies }: SettingsClientProps) {
  const { t } = useLocale();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 font-playfair uppercase">
          {t("settingsTitle")}
        </h1>
        <p className="text-neutral-500 text-xs sm:text-base font-medium opacity-80">
          {t("settingsSubtitle")}
        </p>
      </div>

      <SettingsForm settings={settings} policies={policies} />
    </div>
  );
}
