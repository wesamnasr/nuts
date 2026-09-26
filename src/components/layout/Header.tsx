"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Menu, X, Globe } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import { useCartStore } from "@/hooks/use-cart";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

import Image from "next/image";

export function Header({ storeName, salesNumber, logoUrl }: { storeName?: { en: string; ar: string }; salesNumber?: string; logoUrl?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isCartOpen = useCartStore((state) => state.isOpen);
  const setIsCartOpen = useCartStore((state) => state.setOpen);
  const { t, toggleLocale, locale } = useLocale();

  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const [isMounted, setIsMounted] = useState(false);


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Update scrolled state (for background glassmorphism)
      setIsScrolled(currentScrollY > 20);

      // Update visibility state (show on scroll up, hide on scroll down)
      // Always show if near the top
      if (currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && !isMobileMenuOpen) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMobileMenuOpen]);


  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isVisible ? "translate-y-0" : "-translate-y-full"
          } ${isScrolled
            ? "bg-white/90 backdrop-blur-xl border-neutral-100 shadow-sm py-1.5 sm:py-2"
            : "bg-white/50 backdrop-blur-md border-transparent py-3 sm:py-4"
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity">
            {logoUrl && (
              <div className="relative h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 overflow-hidden rounded-lg shadow-sm border border-neutral-100 bg-white">
                <Image src={logoUrl} alt="Store Logo" fill className="object-contain p-1" />
              </div>
            )}
            <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-primary uppercase">
              {locale === "ar" ? (storeName?.ar || "أثاث فاخر") : (storeName?.en || "FURNITURE")}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-8 font-semibold text-sm tracking-wide uppercase">
            <Link href="/" className="text-secondary hover:text-primary transition-colors">
              {t("home")}
            </Link>
            <Link href="/shop" className="text-secondary hover:text-primary transition-colors">
              {t("shop")}
            </Link>
            <Link href="/about" className="text-secondary hover:text-primary transition-colors">
              {t("about")}
            </Link>
            <Link href="/works" className="text-secondary hover:text-primary transition-colors">
              {t("our_works")}
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              className="p-2 rounded-xl hover:bg-neutral-100 transition-colors hidden sm:flex text-secondary"
              aria-label={t("search")}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Switcher - Icon only on very small screens */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl hover:bg-neutral-100 transition-colors text-xs sm:text-sm font-bold text-secondary"
              aria-label="Switch language"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{t("language")}</span>
            </button>

            <button
              className="p-2 rounded-xl hover:bg-neutral-100 transition-colors relative text-secondary"
              aria-label={t("cart")}
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {isMounted && totalItems > 0 && (
                <span className="absolute top-1 right-1 sm:-top-1 sm:-end-1 bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-md border border-white animate-in zoom-in-50">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Toggle */}
            <div className="lg:hidden ml-1">
              {isMounted && (
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <button
                      className="p-2 rounded-xl hover:bg-neutral-100 transition-colors text-primary"
                      aria-label="Toggle menu"
                    >
                      <Menu className="w-6 h-6" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side={locale === "ar" ? "right" : "left"} className="w-[300px] sm:w-[400px] border-none p-0 flex flex-col bg-white">
                    <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                      <SheetTitle className="text-xl font-black text-primary uppercase">
                        {locale === "ar" ? (storeName?.ar || "أثاث فاخر") : (storeName?.en || "FURNITURE")}
                      </SheetTitle>
                    </div>
                    <nav className="flex flex-col p-6 gap-2">
                      {[
                        { href: "/", label: t("home") },
                        { href: "/shop", label: t("shop") },
                        { href: "/about", label: t("about") },
                        { href: "/works", label: t("our_works") },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-4 px-6 rounded-2xl text-lg font-bold text-secondary hover:bg-neutral-50 hover:text-primary transition-all flex items-center justify-between group"
                        >
                          {item.label}
                          <div className="w-8 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-auto p-8 border-t border-neutral-100 bg-neutral-50/50">
                      <p className="text-xs text-neutral-400 font-medium mb-4 uppercase tracking-widest">{t("followUs")}</p>
                      <div className="flex gap-4">
                        {/* Placeholder for social icons if needed */}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>
      </header>

      <CartDrawer open={isCartOpen} setOpen={setIsCartOpen} whatsappNumber={salesNumber} storeName={locale === "ar" ? (storeName?.ar || "المتجر") : (storeName?.en || "The Store")} />
    </>
  );
}

