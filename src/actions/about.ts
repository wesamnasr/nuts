"use server";

import { revalidatePath } from "next/cache";

export type AboutSection = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
};

const defaultNutsSections: AboutSection[] = [
  {
    id: "story-1",
    titleAr: "حكايتنا في عالم المكسرات الفاخرة",
    titleEn: "Our Story in Gourmet Nuts",
    descriptionAr: "انطلقت محامص نَتس من شغفنا بتقديم مكسرات استثنائية لا تُقارن. ننتقي أفضل المحاصيل من مزارع كاليفورنيا وفيتنام وتركيا وتشيلي، لنقدم لعملائنا في مصر مذاقاً نقياً وطازجاً في كل حبة.",
    descriptionEn: "Nuts Roastery was born from a passion for delivering truly exceptional nuts. We source the finest harvests from premier farms across California, Vietnam, Turkey, and Chile to bring Egyptian food lovers a pure, fresh crunch in every bite.",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1000&auto=format&fit=crop",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "story-2",
    titleAr: "فن التحميص اليومي الهوائي",
    titleEn: "Daily Artisan Air Roasting",
    descriptionAr: "نعتمد على تقنيات تحميص حديثة تعتمد على الهواء الساخن بدون زيوت مهدرجة، مما يبرز الزيوت الطبيعية والنكهة الغنية للمكسرات ويحافظ على قرمشتها العالية وقيمتها الغذائية.",
    descriptionEn: "We utilize modern hot-air roasting techniques without hydrogenated oils, highlighting the natural oils and rich nutty aroma while preserving optimal crunchiness and nutritional value.",
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?q=80&w=1000&auto=format&fit=crop",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "story-3",
    titleAr: "تغليف مفرغ من الهواء لأعلى مستويات الطزاجة",
    titleEn: "Airtight Vacuum Packaging for Maximum Freshness",
    descriptionAr: "جميع منتجاتنا تعبأ في أكياس محكمة الإغلاق ومفرغة من الأكسجين أو برطمانات زجاجية صحية، لتصلك كما لو كانت قد خرجت للتو من المحمصة مباشرة إلى باب منزلك في أي محافظة بمصر.",
    descriptionEn: "All our products are packaged in vacuum-sealed zipper pouches or premium glass jars, ensuring they reach your doorstep across all Egyptian governorates as fresh as the moment they were roasted.",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?q=80&w=1000&auto=format&fit=crop",
    sortOrder: 2,
    isActive: true,
  }
];

export async function getAboutSections() {
  return { success: true, data: defaultNutsSections };
}

export async function createAboutSection(data: {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image?: string;
}) {
  revalidatePath("/about");
  return { success: true, data: { id: `section-${Date.now()}`, ...data, sortOrder: 0, isActive: true } };
}

export async function updateAboutSection(
  id: string,
  data: Partial<AboutSection>,
) {
  revalidatePath("/about");
  return { success: true, data: { id, ...data } };
}

export async function deleteAboutSection(id: string) {
  revalidatePath("/about");
  return { success: true };
}

export async function reorderAboutSections(
  items: { id: string; sortOrder: number }[],
) {
  revalidatePath("/about");
  return { success: true };
}
