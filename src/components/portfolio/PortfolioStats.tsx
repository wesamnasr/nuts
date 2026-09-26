"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/i18n/LocaleContext";
import { Trophy, Users, Hammer, Star } from "lucide-react";
import type { ElementType } from "react";

interface Stat {
  id: number | string;
  value: string;
  labelAr: string;
  labelEn: string;
}

interface PortfolioStatsProps {
  stats?: Stat[] | string;
}

export function PortfolioStats({ stats: customStats }: PortfolioStatsProps) {
  const { locale } = useLocale();

  // Static definitions for icons and colors mapping by ID
  const staticDefinitions: Record<number | string, { icon: ElementType, color: string, bg: string }> = {
    1: { icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
    2: { icon: Star, color: "text-blue-500", bg: "bg-blue-500/10" },
    3: { icon: Hammer, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    4: { icon: Users, color: "text-rose-500", bg: "bg-rose-500/10" },
  };

  const defaultStats = [
    { id: 1, value: "+500", labelAr: "مشروع تم تنفيذه", labelEn: "Projects Completed" },
    { id: 2, value: "10", labelAr: "سنوات خبرة", labelEn: "Years of Experience" },
    { id: 3, value: "100%", labelAr: "خشب طبيعي", labelEn: "Natural Wood" },
    { id: 4, value: "+15k", labelAr: "عميل سعيد", labelEn: "Happy Clients" },
  ];

  // Use custom stats if provided (parsing string JSON if needed), otherwise defaults
  // The backend might return stats as a string if it's stored as JSON string, or object if Prisma handles it. 
  // We'll safely handle both.
  let activeStats = customStats;
  
  if (typeof activeStats === 'string') {
    try {
        activeStats = JSON.parse(activeStats);
    } catch {
        activeStats = defaultStats;
    }
  }

  if (!activeStats || !Array.isArray(activeStats) || activeStats.length === 0) {
    activeStats = defaultStats;
  }

  const typedStats = activeStats as Stat[];

  return (
    <div className="w-[90%] max-w-[2000px] mx-auto px-4 mb-16 sm:mb-24">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-10">
        {typedStats.map((stat, index) => {
            const def = staticDefinitions[stat.id] || staticDefinitions[1];
            const Icon = def.icon;

            return (
              <motion.div
                key={stat.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group overflow-hidden"
              >
                {/* Glass Card */}
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-white/40 shadow-xl shadow-neutral-200/50 flex flex-col items-center text-center transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-white/60">
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl mb-3 sm:mb-4 flex items-center justify-center shadow-md transition-all duration-500 group-hover:rotate-6 ${def.bg} ${def.color}`}>
                        <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                    </div>
                    
                    <div className="space-y-0.5 sm:space-y-1">
                        <h3 className="text-xl sm:text-2xl md:text-4xl font-black text-neutral-900 tracking-tighter">
                            {stat.value}
                        </h3>
                        <div className="flex items-center gap-1.5 sm:gap-2 justify-center">
                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                            <p className="text-[8px] sm:text-[10px] md:text-xs text-neutral-500 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                                {locale === "ar" ? stat.labelAr : stat.labelEn}
                            </p>
                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                        </div>
                    </div>

                    {/* Subtle Glow on Hover */}
                    <div className="absolute -inset-10 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                </div>
              </motion.div>
            )
        })}
      </div>
    </div>
  );
}
