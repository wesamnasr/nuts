"use client";

import { useLocale } from "@/i18n/LocaleContext";
import { Award, Truck, ShieldCheck, Flame, Sparkles } from "lucide-react";
import Image from "next/image";

type Feature = {
  id?: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon?: string;
  sortOrder?: number;
};

const iconMap: Record<string, React.ReactNode> = {
  Flame: <Flame className="w-10 h-10 text-amber-600" />,
  ShieldCheck: <ShieldCheck className="w-10 h-10 text-amber-600" />,
  Truck: <Truck className="w-10 h-10 text-amber-600" />,
  Sparkles: <Sparkles className="w-10 h-10 text-amber-600" />,
  Award: <Award className="w-10 h-10 text-amber-600" />,
};

function renderFeatureIcon(icon?: string) {
  if (!icon) return <Award className="w-10 h-10 text-amber-600" />;
  if (iconMap[icon]) return iconMap[icon];
  if (icon.startsWith("http://") || icon.startsWith("https://") || icon.startsWith("/")) {
    return (
      <div className="relative w-10 h-10">
        <Image src={icon} alt="" fill className="object-contain" />
      </div>
    );
  }
  return <Award className="w-10 h-10 text-amber-600" />;
}

export function FeaturesSection({ customFeatures = [] }: { customFeatures?: Feature[] }) {
  const { locale } = useLocale();

  const isAr = locale === "ar";

  const defaultFeatures = [
    {
      icon: <Award className="w-10 h-10 text-amber-600" />,
      title: isAr ? "جودة استثنائية وطازجة" : "Exceptional Fresh Quality",
      desc: isAr ? "ننتقي أجود الحبات من أفضل المزارع العالمية مع تحميص هوائي طازج يومياً بدون زيوت مهدرجة." : "We source the finest grades from top global farms with daily fresh air-roasting.",
    },
    {
      icon: <Truck className="w-10 h-10 text-amber-600" />,
      title: isAr ? "شحن سريع لجميع محافظات مصر" : "Fast Delivery Across Egypt",
      desc: isAr ? "توصيل سريع لباب منزلك في القاهرة، الجيزة، الإسكندرية وجميع محافظات الجمهورية." : "Fast delivery directly to your doorstep in Cairo, Giza, Alexandria and all Egypt governorates.",
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-amber-600" />,
      title: isAr ? "تغليف مفرغ من الهواء وضمان القرمشة" : "Vacuum Sealed & Crunch Guarantee",
      desc: isAr ? "عبوات زيبر محكمة الغلق ومفرغة من الهواء للحفاظ على النكهة والقرمشة الفائقة." : "Airtight vacuum zipper pouches to ensure peak crunchiness and aroma down to the last nut.",
    },
  ];

  // Map custom features to match the structure we need
  const featuresToDisplay = customFeatures.length > 0
    ? customFeatures.map(f => ({
      icon: renderFeatureIcon(f.icon),
      title: locale === 'ar' ? f.titleAr : f.titleEn,
      desc: locale === 'ar' ? f.descAr : f.descEn
    }))
    : defaultFeatures;

  return (
    <section className="py-12 sm:py-24 bg-white border-t border-neutral-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 lg:gap-12">
          {featuresToDisplay.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 sm:p-10 bg-neutral-50/50 rounded-[2rem] sm:rounded-[2.5rem] hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 border border-transparent hover:border-neutral-100 flex flex-col items-center sm:items-start text-center sm:text-start"
            >
              <div className="w-12 h-12 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 mb-6 sm:mb-8 overflow-hidden">
                <div className="p-3 sm:p-5 group-hover:brightness-0 group-hover:invert transition-all">
                  {/* Scale icon content */}
                  <div className="scale-75 sm:scale-100">
                    {feature.icon}
                  </div>
                </div>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-neutral-900 mb-2 sm:mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-neutral-500 text-sm sm:text-lg font-medium leading-relaxed">{feature.desc}</p>

              {/* Decorative accent */}
              <div className="absolute top-6 right-6 sm:top-8 sm:right-8 w-6 h-6 sm:w-8 sm:h-8 opacity-5 group-hover:opacity-10 transition-opacity">
                {feature.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
