"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPortfolioConfig() {
  try {
    let config = await prisma.portfolioConfig.findFirst();

    if (!config) {
      config = await prisma.portfolioConfig.create({
        data: {
          heroTitleAr:
            "حلول مبتكرة للتصميم الداخلي والتشطيبات المعمارية في السعودية",
          heroTitleEn:
            "Innovative Solutions for Interior Design & Architectural Finishes",
          heroDescAr:
            "إذا كنت تبحث عن تصميمات مبتكرة تشع بالجمال والذوق الرفيع، فأنت في المكان الصحيح. في شركة مفهوم جديد للديكور، نقدم لك حلولًا معمارية فاخرة تشبع تطلعاتك وتناسب كل ذوق. سواء كنت بحاجة لتصميم داخلي لبيتك أو مكتبك، أو كنت تبحث عن تشطيبات معمارية مميزة، نحن هنا لنحول أفكارك إلى واقع ملموس بكل دقة واهتمام بالتفاصيل.",
          heroDescEn:
            "If you are looking for innovative designs that radiate beauty and high taste, you are in the right place. At New Concept Decor, we offer luxurious architectural solutions that satisfy your aspirations and suit every taste. Whether you need interior design for your home or office, or are looking for distinctive architectural finishes, we are here to turn your ideas into tangible reality with precision and attention to detail.",
          showStats: true,
          stats: [
            {
              id: 1,
              value: "+500",
              labelAr: "مشروع تم تنفيذه",
              labelEn: "Projects Completed",
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
            {
              id: 2,
              value: "10",
              labelAr: "سنوات خبرة",
              labelEn: "Years of Experience",
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              id: 3,
              value: "100%",
              labelAr: "خشب طبيعي",
              labelEn: "Natural Wood",
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
            },
            {
              id: 4,
              value: "+15k",
              labelAr: "عميل سعيد",
              labelEn: "Happy Clients",
              color: "text-rose-500",
              bg: "bg-rose-500/10",
            },
          ],
        },
      });
    }

    // Parse stats if it's a string (it might be returned as object depending on Prisma version/type)
    // But since we defined it as Json, Prisma usually returns object.
    // However, if we forced stringify on create, we might need to be careful.
    // Actually, Prisma Json type handles Objects directly. I should pass object to create, not stringified string if the type is Json.
    // Wait, the schema says `stats Json?`.
    // Let me fix the create payload to pass an object, not a string.

    return { success: true, data: config };
  } catch (error) {
    console.error("Failed to get portfolio config:", error);
    return { success: false, error: "Failed to load config" };
  }
}

export interface PortfolioStat {
  id: number | string;
  value: string;
  labelAr: string;
  labelEn: string;
  color?: string;
  bg?: string;
}

export async function updatePortfolioConfig(data: {
  heroTitleAr: string;
  heroTitleEn: string;
  heroDescAr: string;
  heroDescEn: string;
  stats: PortfolioStat[];
  showStats: boolean;
}) {
  try {
    const first = await prisma.portfolioConfig.findFirst();

    if (first) {
      await prisma.portfolioConfig.update({
        where: { id: first.id },
        data: {
          heroTitleAr: data.heroTitleAr,
          heroTitleEn: data.heroTitleEn,
          heroDescAr: data.heroDescAr,
          heroDescEn: data.heroDescEn,
          stats: data.stats as any, // Pass object directly
          showStats: data.showStats ?? true,
        },
      });
    } else {
      await prisma.portfolioConfig.create({
        data: {
          heroTitleAr: data.heroTitleAr,
          heroTitleEn: data.heroTitleEn,
          heroDescAr: data.heroDescAr,
          heroDescEn: data.heroDescEn,
          stats: data.stats as any,
          showStats: data.showStats ?? true,
        },
      });
    }

    revalidatePath("/works");
    revalidatePath("/admin/portfolio");
    return { success: true };
  } catch (error) {
    console.error("Failed to update portfolio config:", error);
    return { success: false, error: "Failed to update config" };
  }
}
