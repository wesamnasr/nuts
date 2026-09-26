"use server";

export interface PortfolioStat {
  id: number | string;
  value: string;
  labelAr: string;
  labelEn: string;
  color?: string;
  bg?: string;
}

export async function getPortfolioConfig() {
  return {
    success: true,
    data: {
      id: "config-1",
      heroTitleAr: "محامص ومكسرات نَتس",
      heroTitleEn: "NUTS Roastery",
      heroDescAr: "أجود أنواع المكسرات الفاخرة والطازجة في مصر",
      heroDescEn: "Finest fresh and roasted gourmet nuts in Egypt",
      showStats: false,
      stats: [],
    },
  };
}

export async function updatePortfolioConfig(data: any) {
  return { success: true };
}
