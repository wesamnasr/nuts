"use client";
import Link from "next/link";
import { Facebook, Instagram, MessageCircle, Music2, Ghost, MapPin } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FooterProps {
  storeName?: { en: string; ar: string };
  logoUrl?: string;
  socialLinks?: {
    whatsappUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    snapchatUrl?: string;
    facebookUrl?: string;
  };
  addressEn?: string;
  addressAr?: string;
}

export function Footer({ storeName, logoUrl, socialLinks, addressEn, addressAr }: FooterProps) {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";

  return (
    <footer className="bg-neutral-900 text-white pt-12 sm:pt-20 pb-8 sm:pb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand & Location */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-8">
             <div className="flex items-center gap-3 sm:gap-4">
              {logoUrl && (
                <div className="relative h-11 w-11 sm:h-14 sm:w-14 overflow-hidden rounded-xl sm:rounded-2xl bg-white p-1.5 sm:p-2 shadow-xl">
                  <Image src={logoUrl} alt="Store Logo" fill className="object-contain" />
                </div>
              )}
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-white">
                  {locale === "ar" ? (storeName?.ar || "أثاث فاخر") : (storeName?.en || "FURNITURE")}
                </h3>
                <div className="h-0.5 sm:h-1 w-10 sm:w-12 bg-primary mt-1 rounded-full" />
              </div>
            </div>
            <p className="text-neutral-400 text-sm sm:text-base max-w-sm leading-relaxed font-medium">{t("brandDesc")}</p>

            {/* Find Us Section */}
            <div className="pt-4 space-y-6">
              <h4 className="font-bold text-white flex items-center gap-2 text-base sm:text-lg">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                {t("footerLocation")}
              </h4>
              <a
                href="https://maps.google.com/?q=New+Concept+Furniture+Jeddah"
                target="_blank"
                rel="noopener noreferrer"
                className="group block space-y-2 max-w-xs"
              >
                <p className="text-neutral-300 text-sm font-semibold group-hover:text-primary transition-colors leading-relaxed">
                  {locale === "ar"
                    ? (addressAr || "شارع المكرونة، حي الربوة، جدة، المملكة العربية السعودية")
                    : (addressEn || "Al Makarunah St, Ar Rabwah, Jeddah, Saudi Arabia")}
                </p>
                <div className="inline-flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  {isAr ? "فتح الخريطة" : "Open Map"}
                  <div className="w-4 h-[1px] bg-primary" />
                </div>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-6">
            <h4 className="font-bold text-white text-lg relative inline-block">
              {t("quickLinks")}
              <div className="absolute -bottom-2 start-0 w-8 h-1 bg-primary/30 rounded-full" />
            </h4>
            <ul className="space-y-4 text-sm font-medium text-neutral-400">
              <li>
                <Link href="/" className="hover:text-primary hover:translate-x-1 transition-all inline-block">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-primary hover:translate-x-1 transition-all inline-block">
                  {t("shop")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary hover:translate-x-1 transition-all inline-block">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/works" className="hover:text-primary hover:translate-x-1 transition-all inline-block">
                  {t("our_works")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-6">
            <h4 className="font-bold text-white text-lg relative inline-block">
              {t("policies")}
              <div className="absolute -bottom-2 start-0 w-8 h-1 bg-primary/30 rounded-full" />
            </h4>
            <ul className="space-y-4 text-sm font-medium text-neutral-400">
              <li>
                <Link href="/about#policies" className="hover:text-primary transition-colors inline-block">
                  {t("shipping")}
                </Link>
              </li>
              <li>
                <Link href="/about#policies" className="hover:text-primary transition-colors inline-block">
                  {t("returns")}
                </Link>
              </li>
              <li>
                <Link href="/about#policies" className="hover:text-primary transition-colors inline-block">
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-6">
            <h4 className="font-bold text-white text-lg relative inline-block">
              {t("followUs")}
              <div className="absolute -bottom-2 start-0 w-8 h-1 bg-primary/30 rounded-full" />
            </h4>
            <div className="flex flex-wrap gap-3">
              {[
                { url: socialLinks?.whatsappUrl, icon: MessageCircle, color: "hover:bg-[#25D366]", textColor: "text-[#25D366]" },
                { url: socialLinks?.instagramUrl, icon: Instagram, color: "hover:bg-[#E4405F]", textColor: "text-[#E4405F]" },
                { url: socialLinks?.tiktokUrl, icon: Music2, color: "hover:bg-black", textColor: "text-white" },
                { url: socialLinks?.snapchatUrl, icon: Ghost, color: "hover:bg-[#FFFC00]", textColor: "text-[#e6e600]", darkText: true },
                { url: socialLinks?.facebookUrl, icon: Facebook, color: "hover:bg-[#1877F2]", textColor: "text-[#1877F2]" },
              ].map((social, i) => social.url && (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                   className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg sm:rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                    social.color,
                    "group"
                  )}
                  aria-label="Social Link"
                >
                  <social.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 transition-colors", social.textColor, "group-hover:text-white", social.darkText && "group-hover:text-black")} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-start">
          <p className="text-sm text-neutral-500 font-medium tracking-tight">
            © {new Date().getFullYear()}{" "}
            <span className="text-white">
              {locale === "ar" ? (storeName?.ar || "معرض الأثاث الفاخر") : (storeName?.en || "Furniture Store")}
            </span>
            . {t("rights")}
          </p>
          <div className="flex items-center gap-6 text-xs text-neutral-600 font-bold uppercase tracking-widest">
            <Link href="/about" className="hover:text-white transition-colors">{t("privacy")}</Link>
            <Link href="/about" className="hover:text-white transition-colors">{t("returns")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
