"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Award, Sparkles, Heart, Star, Target, Zap, MessageCircle, Instagram, Facebook, Music2, Ghost } from "lucide-react";
import { AboutSection } from "@/actions/about";
import { PolicyData, SettingsMap } from "@/actions/settings";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";
import { StoreMap } from "@/components/sections/StoreMap";

interface AboutClientProps {
  settings: SettingsMap;
  storeName: {
    en: string;
    ar: string;
  };
  sections: AboutSection[];
  policies: PolicyData[];
}

export function AboutClient({ settings, sections, policies }: Omit<AboutClientProps, 'storeName'>) {
  const { t, locale } = useLocale();

  // Fallback icons if needed, can be expanded
  const icons = [Award, Sparkles, Star, Target, Zap];

  return (
    <div className="min-h-screen bg-neutral-50 overflow-hidden">
      <div className="container mx-auto px-4 py-8 md:py-24 space-y-12 md:space-y-32">
        
        {sections.length > 0 ? (
            sections.map((section, index) => {
                const isEven = index % 2 === 0;
                const Icon = icons[index % icons.length];
                
                return (
                    <section key={section.id} className="grid md:grid-cols-2 gap-12 items-center">
                         {/* Image Column */}
                        <motion.div
                            initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className={cn(
                                "relative aspect-square md:aspect-4/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl group",
                                isEven ? "md:order-last" : "md:order-first"
                            )}
                        >
                            {section.image ? (
                                <Image
                                src={section.image}
                                alt={locale === "ar" ? section.titleAr : section.titleEn}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400">
                                    <Icon className="w-20 h-20 opacity-20" />
                                </div>
                            )}
                        </motion.div>

                        {/* Text Column */}
                        <motion.div
                            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[#d8a868]">
                                <Icon className="h-6 w-6" />
                                <span className="text-sm font-bold tracking-widest uppercase">
                                     {locale === "ar" ? "نبذة عنا" : "About Us"}
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-4xl font-bold text-neutral-900 leading-tight">
                                {locale === "ar" ? section.titleAr : section.titleEn}
                            </h2>
                            </div>
                            
                            <div className="space-y-6 text-base md:text-lg text-neutral-600 leading-relaxed">
                            <p className="whitespace-pre-line">
                                {locale === "ar" ? section.descriptionAr : section.descriptionEn}
                            </p>
                            </div>
                        </motion.div>
                    </section>
                );
            })
        ) : (
            // Empty State / Fallback if no sections
             <div className="text-center py-20">
                <p className="text-neutral-500">
                    {locale === "ar" ? "لا توجد أقسام مضافة حالياً." : "No about sections added yet."}
                </p>
             </div>
        )}

        {/* Policies Section */}
        <motion.section
          id="policies"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-16"
        >
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
              {locale === "ar" ? "سياسات المعرض" : "Store Policies"}
            </h2>
            <p className="text-neutral-600">
              {locale === "ar" 
                ? "تعرف على سياسات الشحن، الاسترجاع، والخصوصية الخاصة بنا." 
                : "Learn about our shipping, return, and privacy policies."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {policies?.filter((p: PolicyData) => p.type === "SHIPPING" || p.type === "RETURN").map((policy: PolicyData) => (
              <div key={policy.id} className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 text-primary">
                  {policy.type === "SHIPPING" ? <Zap className="w-5 h-5 sm:w-6 sm:h-6" /> : <Heart className="w-5 h-5 sm:w-6 sm:h-6" />}
                </div>
                <h3 className="text-xl font-bold mb-4">
                  {locale === "ar" 
                    ? (policy.type === "SHIPPING" ? "الشحن والتوصيل" : "الاستبدال والاسترجاع")
                    : (policy.type === "SHIPPING" ? "Shipping & Delivery" : "Returns & Exchanges")}
                </h3>
                <p className="text-neutral-600 leading-relaxed whitespace-pre-line text-sm">
                  {locale === "ar" ? policy.contentAr : policy.contentEn}
                </p>
              </div>
            ))}
            
             {/* Privacy Policy */}
            <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 text-primary">
                <Target className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                {locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
              </h3>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                {locale === "ar" 
                  ? "نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. لا نقوم بمشاركة معلوماتك مع أي أطراف خارجية بدون موافقتك الصريحة." 
                  : "We respect your privacy and are committed to protecting your personal data. We do not share your information with third parties without your explicit consent."}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Social Connect Section */}
         <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-10 sm:space-y-12 py-8 sm:py-12 border-t border-neutral-200"
        >
          <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
              {t("followJourneyTitle")}
            </h2>
            <p className="text-neutral-600 text-sm sm:text-lg leading-relaxed">
              {t("followJourneyDesc")}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {([
              { 
                icon: MessageCircle, 
                href: settings.whatsappUrl, 
                label: "WhatsApp", 
                color: "hover:text-[#25D366] hover:bg-[#25D366]/10",
                show: !!settings.whatsappUrl 
              },
              { 
                icon: Instagram, 
                href: settings.instagramUrl, 
                label: "Instagram", 
                color: "hover:text-[#E4405F] hover:bg-[#E4405F]/10",
                show: !!settings.instagramUrl 
              },
              { 
                icon: Music2, 
                href: settings.tiktokUrl, 
                label: "TikTok", 
                color: "hover:text-[#000000] hover:bg-[#000000]/10",
                show: !!settings.tiktokUrl 
              },
              { 
                icon: Ghost, 
                href: settings.snapchatUrl, 
                label: "Snapchat", 
                color: "hover:text-[#FFFC00] hover:bg-[#FFFC00]/10",
                show: !!settings.snapchatUrl 
              },
              { 
                icon: Facebook, 
                href: settings.facebookUrl, 
                label: "Facebook", 
                color: "hover:text-[#1877F2] hover:bg-[#1877F2]/10",
                show: !!settings.facebookUrl 
              },
            ] as { icon: React.ElementType; href: string; label: string; color: string; show: boolean }[]).filter(s => s.show).map((social, i) => (

              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex flex-col items-center gap-2 sm:gap-3 p-2.5 sm:p-6 rounded-xl sm:rounded-3xl transition-all duration-300 border border-transparent bg-white shadow-sm hover:shadow-xl hover:-translate-y-1",
                  social.color
                )}
              >
                <social.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {social.label}
                </span>
              </a>
            ))}
          </div>
        </motion.section>

        <StoreMap 
          mapCoordinates={settings.mapCoordinates}
          googleMapsUrl={settings.googleMapsUrl}
          addressEn={settings.storeAddressEn}
          addressAr={settings.storeAddressAr}
        />

        {/* Closing Logo Section */}
         <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-8 sm:p-12 shadow-xl border border-neutral-100 text-center space-y-6 sm:space-y-8 max-w-3xl mx-auto"
        >
          {settings.logoUrl && (
            <div className="relative aspect-auto h-16 sm:h-24 w-full mx-auto">
              <Image 
                src={settings.logoUrl} 
                alt="Store Logo" 
                fill
                className="object-contain"
              />
            </div>
          )}
          <Heart className="h-8 w-8 sm:h-12 sm:w-12 text-[#d8a868] mx-auto opacity-80" />
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            {locale === "ar" ? "صنع بحب" : "Made with Love"}
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base max-w-lg mx-auto">
            {locale === "ar" 
              ? "من عائلتنا إلى عائلتكم، نأمل أن تجدوا شيئاً يجعل منزلكم يشعر بالدفء أكثر."
              : "From our family to yours, we hope you find something that makes your house feel a little more like home."}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
