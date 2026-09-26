import { useLocale } from "@/i18n/LocaleContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flame, ShieldCheck, Truck, Sparkles, Scale, Heart } from "lucide-react";

export type ProductData = {
  originCountryAr?: string | null;
  originCountryEn?: string | null;
  roastTypeAr?: string | null;
  roastTypeEn?: string | null;
  caloriesPer100g?: number | null;
  proteinPer100g?: any;
  isKeto?: boolean;
  isRaw?: boolean;
  isOrganic?: boolean;
  // Fallbacks
  materialAr?: string | null;
  materialEn?: string | null;
  madeInAr?: string | null;
  madeInEn?: string | null;
  warrantyAr?: string | null;
  warrantyEn?: string | null;
  deliveryInstallationAr?: string | null;
  deliveryInstallationEn?: string | null;
};

type ActiveVariant = {
  weightGram?: number;
  packageTypeAr?: string | null;
  packageTypeEn?: string | null;
  flavorAr?: string | null;
  flavorEn?: string | null;
  detailedSizeAr?: string | null;
  detailedSizeEn?: string | null;
  sizeNameAr?: string | null;
  sizeNameEn?: string | null;
};

export type Policy = {
  type: string;
  contentAr: string;
  contentEn: string;
};

type Props = {
  product: ProductData;
  activeVariant: ActiveVariant;
  policies?: Policy[];
};

export function ProductTabs({ product, activeVariant }: Props) {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const specs = [
    {
      label: isAr ? "نوع التحميص" : "Roast Type",
      value: isAr ? product.roastTypeAr || "محمص طازج" : product.roastTypeEn || "Fresh Roasted",
    },
    {
      label: isAr ? "بلد المنشأ" : "Origin Country",
      value: isAr ? product.originCountryAr || "فاخر منتقى" : product.originCountryEn || "Imported",
    },
    {
      label: isAr ? "السعرات (لكل 100 جم)" : "Calories (per 100g)",
      value: product.caloriesPer100g ? `${product.caloriesPer100g} ${isAr ? "سعرة" : "kcal"}` : null,
    },
    {
      label: isAr ? "نسبة البروتين" : "Protein",
      value: product.proteinPer100g ? `${Number(product.proteinPer100g)} ${isAr ? "جم لكل 100 جم" : "g / 100g"}` : null,
    },
    {
      label: isAr ? "مناسب للكيتو" : "Keto-friendly",
      value: product.isKeto ? (isAr ? "نعم ✓" : "Yes ✓") : null,
    },
  ].filter((s) => s.value);

  const weightInfo = activeVariant.weightGram
    ? (activeVariant.weightGram >= 1000
        ? `${activeVariant.weightGram / 1000} ${isAr ? "كجم" : "kg"}`
        : `${activeVariant.weightGram} ${isAr ? "جم" : "g"}`)
    : (isAr ? activeVariant.sizeNameAr : activeVariant.sizeNameEn);

  return (
    <div className="w-full">
      <Tabs defaultValue="nutrition" className="w-full">
        <TabsList className="w-full justify-start border-b border-neutral-200 rounded-none bg-transparent p-0 h-auto gap-8">
          <TabsTrigger
            value="nutrition"
            className="data-[state=active]:border-amber-600 data-[state=active]:text-amber-800 border-b-2 border-transparent rounded-none px-2 py-4 font-bold text-sm bg-transparent shadow-none"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <span>{isAr ? "القيمة الغذائية والمواصفات" : "Nutrition & Specs"}</span>
            </div>
          </TabsTrigger>

          <TabsTrigger
            value="packaging"
            className="data-[state=active]:border-amber-600 data-[state=active]:text-amber-800 border-b-2 border-transparent rounded-none px-2 py-4 font-bold text-sm bg-transparent shadow-none"
          >
            <div className="flex items-center gap-2">
              <Scale size={16} />
              <span>{isAr ? "الوزن والتعبئة" : "Packaging & Freshness"}</span>
            </div>
          </TabsTrigger>

          <TabsTrigger
            value="delivery"
            className="data-[state=active]:border-amber-600 data-[state=active]:text-amber-800 border-b-2 border-transparent rounded-none px-2 py-4 font-bold text-sm bg-transparent shadow-none"
          >
            <div className="flex items-center gap-2">
              <Truck size={16} />
              <span>{isAr ? "الشحن والدفع في مصر" : "Egypt Delivery & Payments"}</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Specs & Nutrition */}
        <TabsContent value="nutrition" className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specs.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 flex flex-col">
                <span className="text-xs text-neutral-400 font-bold mb-1">{item.label}</span>
                <span className="text-sm font-bold text-neutral-800">{item.value}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Packaging */}
        <TabsContent value="packaging" className="pt-6">
          <div className="space-y-4 max-w-2xl text-sm text-neutral-600 leading-relaxed">
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 flex items-start gap-3">
              <ShieldCheck className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h5 className="font-bold text-neutral-900 mb-1">
                  {isAr ? "تغليف محكم يحفظ النكهة والقرمشة" : "Airtight Freshness Protection"}
                </h5>
                <p className="text-xs text-neutral-600">
                  {isAr
                    ? "تُعبأ جميع مكسراتنا في أكياس مفرغة من الهواء محكمة الإغلاق لحمايتها من الرطوبة والحفاظ على طعمها المقرمش الطازج حتى آخر حبة."
                    : "Packed in airtight, vacuum-sealed pouches to maintain natural crunchiness and preserve healthy oils to your doorstep."}
                </p>
              </div>
            </div>
            {weightInfo && (
              <p>
                <strong>{isAr ? "الوزن الحالي المحدد: " : "Selected Weight: "}</strong>
                {weightInfo}
              </p>
            )}
          </div>
        </TabsContent>

        {/* Tab 3: Delivery in Egypt */}
        <TabsContent value="delivery" className="pt-6">
          <div className="space-y-4 max-w-2xl text-sm text-neutral-600 leading-relaxed">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-2">
              <h5 className="font-bold text-neutral-900">{isAr ? "مواعيد الشحن والتوصيل" : "Delivery Schedule"}</h5>
              <ul className="list-disc list-inside space-y-1 text-xs text-neutral-600">
                <li>{isAr ? "القاهرة والجيزة: توصيل سريع خلال 24 ساعة (50 ج.م)" : "Cairo & Giza: Delivery within 24 Hours (50 EGP)"}</li>
                <li>{isAr ? "الإسكندرية والبحيرة: 1 - 2 يوم عمل (65 ج.م)" : "Alexandria: 1-2 Business Days (65 EGP)"}</li>
                <li>{isAr ? "جميع محافظات الدلتا والقناة والصعيد: 2 - 4 أيام عمل" : "Other Egyptian Governorates: 2-4 Business Days"}</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-2">
              <h5 className="font-bold text-neutral-900">{isAr ? "طرق الدفع المعتمدة" : "Accepted Payment Methods"}</h5>
              <p className="text-xs text-neutral-600">
                {isAr
                  ? "نوفر الدفع بجميع المحافظ الإلكترونية (فودافون كاش، اتصالات، أورنج، وي باي)، التحويل الفوري عبر إنستاباي (InstaPay)، بطاقات ميزة والفيزا والماستركارد، بالإضافة إلى الدفع عند الاستلام."
                  : "We accept all Mobile Wallets (Vodafone Cash, Etisalat, Orange, WE), InstaPay transfer, Meeza & Visa/MasterCard cards, and Cash on Delivery (COD)."}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
