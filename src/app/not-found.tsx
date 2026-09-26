"use client";

import Link from "next/link";
import * as motion from "framer-motion/client";
import { useLocale } from "@/i18n/LocaleContext";
import { ArchiveX, ArrowLeft, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] aspect-square rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] aspect-square rounded-full bg-[#8B5E3C]/10 blur-3xl" />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
            <ArchiveX className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-black text-neutral-900 mb-4 tracking-tight">
            404
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-neutral-800 mb-6 px-4">
            {isAr 
              ? "يبدو أن هذه القطعة الفريدة لم تعد متاحة" 
              : "It seems this unique piece is no longer available"}
          </h2>
          
          <p className="text-neutral-500 text-lg max-w-md mx-auto mb-10 leading-relaxed px-4">
            {isAr
              ? "ربما تم نقل الصفحة أو لم تعد موجودة في معرضنا الحالي. دعنا نساعدك في العثور على شيء آخر مذهل."
              : "The page might have been moved or simply doesn't exist in our current collection. Let's find you something else stunning."}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 group transition-all hover:scale-105">
            <Link href="/shop" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              {isAr ? "العودة للمتجر" : "Back to Store"}
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg font-bold border-neutral-200 hover:bg-neutral-50 group transition-all">
            <Link href="/" className="flex items-center gap-2">
              {isAr ? (
                <>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  الصفحة الرئيسية
                </>
              ) : (
                <>
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Homepage
                </>
              )}
            </Link>
          </Button>
        </motion.div>

        {/* Brand signature */}
        <div className="mt-20 opacity-20 select-none">
          <p className="font-serif italic text-xl tracking-widest uppercase">
            {isAr ? "نيو كونسبت للأثاث" : "New Concept Furniture"}
          </p>
        </div>
      </div>
    </div>
  );
}
