"use client";

import { useLocale } from "@/i18n/LocaleContext";
import { Handshake } from "lucide-react";

export function NewsletterSection() {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const partners = [
    {
      name: "Tabby",
      color: "text-[#3EFFF0] drop-shadow-md", 
      icon: (
        <div className="flex items-center justify-center font-black text-4xl tracking-tighter">
          tabby
        </div>
      ),
    },
    {
      name: "Tamara",
      color: "text-[#FFB5A6] drop-shadow-md",
      icon: (
        <div className="flex items-center justify-center font-bold text-4xl tracking-wide font-sans">
          tamara
        </div>
      ),
    },
    {
      name: "Apple Pay",
      color: "text-neutral-800 dark:text-white drop-shadow-md", 
      icon: (
        <div className="flex items-center justify-center gap-1.5 font-semibold text-3xl">
          <svg viewBox="0 0 384 512" className="h-8 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
          </svg>
          Pay
        </div>
      ),
    },
    {
      name: "Mada",
      color: "text-[#01C27B] drop-shadow-md", 
      icon: (
        <div className="flex items-center justify-center font-bold text-4xl tracking-tighter">
          <span className="mr-1">mada</span>
        </div>
      ),
    },
    {
      name: "Visa",
      color: "text-[#1434CB] drop-shadow-md",
      icon: (
          <div className="flex items-center justify-center font-bold text-4xl italic tracking-tighter">
              VISA
          </div>
      )
    },
    {
      name: "Mastercard",
      color: "text-neutral-800 dark:text-white drop-shadow-md",
      icon: (
          <div className="flex items-center justify-center font-bold text-3xl tracking-tighter relative">
              <div className="w-8 h-8 rounded-full bg-[#EB001B] opacity-80 absolute -left-3 mix-blend-multiply"></div>
              <div className="w-8 h-8 rounded-full bg-[#F79E1B] opacity-80 absolute left-3 mix-blend-multiply"></div>
              <span className="z-10 ml-2">Mastercard</span>
          </div>
      )
    }
  ];

  return (
    <section className="relative py-12 sm:py-20 overflow-hidden border-t border-white/5 bg-[#FAFAFA] dark:bg-[#1A1A1A]">
      <div className="w-[90%] max-w-[2000px] relative z-10 mx-auto px-4 text-center mb-10">
        <Handshake className="w-8 h-8 sm:w-12 sm:h-12 text-[#d8a868] mx-auto mb-3 sm:mb-4 opacity-80" />
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-neutral-900 dark:text-white tracking-wide mb-3 sm:mb-4">
          {isAr ? "شركاء النجاح" : "Partners in Success"}
        </h2>
        <p className="text-neutral-500 dark:text-white/60 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? "خيارات دفع مرنة وآمنة مصممة لراحتك. تسوق الآن وادفع بالطريقة التي تناسبك."
            : "Flexible and secure payment options designed for your convenience. Shop now and pay your way."}
        </p>
      </div>

      <div className="relative z-10 flex overflow-hidden group w-full bg-white dark:bg-black/20 py-8 border-y border-neutral-200 dark:border-white/5">
        {/* Left/Right Fades for Marquee */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-20 bg-linear-to-r from-white dark:from-black/20 to-transparent"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 z-20 bg-linear-to-l from-white dark:from-black/20 to-transparent"></div>

        {/* Marquee Track */}
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {/* We duplicate the list 4 times to ensure it fills ultra-wide screens and loops smoothly */}
          {[...partners, ...partners, ...partners, ...partners].map((partner, index) => (
            <div 
              key={`${partner.name}-${index}`}
              className="flex items-center justify-center px-8 md:px-12"
            >
              <div className={`transition-all duration-300 transform hover:scale-110 filter hover:brightness-110 ${partner.color || "text-neutral-400 dark:text-white/50"}`}>
                {partner.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
