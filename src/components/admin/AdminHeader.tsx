"use client";

import { Menu, Globe } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { toggleLocale, locale } = useLocale();

  return (
    <header className="lg:hidden h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sticky top-0 z-40">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="text-neutral-500 hover:text-neutral-900"
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleLocale}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all text-sm font-medium"
        >
          <Globe className="h-4 w-4" />
          <span>{locale === "ar" ? "English" : "العربية"}</span>
        </button>
      </div>
    </header>
  );
}
