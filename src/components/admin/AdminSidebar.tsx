"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/LocaleContext";
import { type TranslationKey } from "@/i18n/translations";
import { logoutAdmin } from "@/actions/auth";
import {
  LayoutDashboard,
  Package,
  Layers,
  MessageSquare,
  Settings,
  Store,
  ChevronRight,
  Globe,
  ChevronLeft,
  Info,
  Briefcase,
  LogOut,
  X,
  type LucideIcon
} from "lucide-react";

interface NavItem {
  labelKey: TranslationKey;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { labelKey: "adminDashboard", href: "/admin", icon: LayoutDashboard },
  { labelKey: "adminProducts", href: "/admin/products", icon: Package },
  { labelKey: "adminCategories", href: "/admin/categories", icon: Layers },
  { labelKey: "adminPortfolio", href: "/admin/portfolio", icon: Briefcase },
  { labelKey: "adminLanding", href: "/admin/landing", icon: LayoutDashboard },
  { labelKey: "adminFeatures", href: "/admin/features", icon: Store },
  { labelKey: "adminReviews", href: "/admin/reviews", icon: MessageSquare },
  { labelKey: "adminAbout", href: "/admin/about", icon: Info },
  { labelKey: "adminSettings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ 
  logoUrl, 
  isOpen, 
  onClose 
}: { 
  logoUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale, toggleLocale, dir } = useLocale();
  const isRtl = dir === "rtl";

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed top-0 h-screen w-64 bg-[#262626] text-white flex flex-col z-50 transition-all duration-300",
        isRtl 
          ? (isOpen ? "right-0" : "right-[-256px] lg:right-0") 
          : (isOpen ? "left-0" : "left-[-256px] lg:left-0")
      )}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="bg-[#d8a868] p-1.5 rounded-lg">
                <Store className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="font-bold text-lg tracking-tight">{t("luxuryAdmin")}</span>
          </div>

          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-neutral-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <NextLink
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                  isActive
                    ? "bg-[#FF7F11] text-white shadow-lg shadow-[#FF7F11]/20"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-white" : "text-neutral-500 group-hover:text-white"
                )} />
                <span>{t(item.labelKey)}</span>
                {isActive && (
                  isRtl ? <ChevronLeft className="mr-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </NextLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={toggleLocale}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
          >
            <Globe className="h-5 w-5" />
            <span>{locale === "ar" ? "English" : "العربية"}</span>
          </button>

          <NextLink
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
          >
            <Store className="h-5 w-5" />
            <span>{t("adminViewSite")}</span>
          </NextLink>
          <button
            onClick={async () => {
              const res = await logoutAdmin();
              if (res.success) {
                router.push("/admin/login");
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>{locale === "ar" ? "تسجيل الخروج" : "Logout"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
