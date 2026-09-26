import { useLocale } from "@/i18n/LocaleContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Package, Ruler, Truck } from "lucide-react";

type ProductData = {
  materialAr: string | null;
  materialEn: string | null;
  madeInAr: string | null;
  madeInEn: string | null;
  warrantyAr: string | null;
  warrantyEn: string | null;
  deliveryInstallationAr: string | null;
  deliveryInstallationEn: string | null;
};

type ActiveVariant = {
  detailedSizeAr: string | null;
  detailedSizeEn: string | null;
  sizeNameAr: string | null;
  sizeNameEn: string | null;
};

export type Policy = {
  type: string;
  contentAr: string;
  contentEn: string;
};

type Props = {
  product: ProductData;
  activeVariant: ActiveVariant;
  policies: Policy[];
};

export function ProductTabs({ product, activeVariant, policies }: Props) {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const specs = [
    {
      label: isAr ? "الخامة" : "Material",
      value: isAr ? product.materialAr : product.materialEn,
    },
    {
      label: isAr ? "صناعة" : "Made In",
      value: isAr ? product.madeInAr : product.madeInEn,
    },
    {
      label: isAr ? "الضمان" : "Warranty",
      value: isAr ? product.warrantyAr : product.warrantyEn,
    },
  ].filter((s) => s.value);

  const sizeInfo =
    (isAr ? activeVariant.detailedSizeAr : activeVariant.detailedSizeEn) ||
    (isAr ? activeVariant.sizeNameAr : activeVariant.sizeNameEn);

  const productDeliveryInfo = isAr ? product.deliveryInstallationAr : product.deliveryInstallationEn;
  const shippingPolicy = policies.find((p) => p.type === "SHIPPING");
  const installPolicy = policies.find((p) => p.type === "INSTALLATION");

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
      <Tabs defaultValue="specs" className="w-full">
        <TabsList className="w-full flex bg-neutral-50/50 p-0 h-auto border-b border-neutral-100 overflow-x-auto scrollbar-hide">
          <TabsTrigger 
            value="specs" 
            className="flex-1 py-4 sm:py-6 px-4 text-sm sm:text-base font-black text-neutral-500 data-[state=active]:text-[#e30613] data-[state=active]:bg-white data-[state=active]:shadow-none transition-all border-b-2 border-transparent data-[state=active]:border-[#e30613] rounded-none hover:text-neutral-700"
          >
            {isAr ? "تفاصيل المنتج" : "Product Details"}
          </TabsTrigger>
          <TabsTrigger 
            value="sizes" 
            className="flex-1 py-4 sm:py-6 px-4 text-sm sm:text-base font-black text-neutral-500 data-[state=active]:text-[#e30613] data-[state=active]:bg-white data-[state=active]:shadow-none transition-all border-b-2 border-transparent data-[state=active]:border-[#e30613] rounded-none hover:text-neutral-700 font-bold"
          >
            {isAr ? "الأبعاد والمقاسات" : "Dimensions"}
          </TabsTrigger>
          <TabsTrigger 
            value="shipping" 
            className="flex-1 py-4 sm:py-6 px-4 text-sm sm:text-base font-black text-neutral-500 data-[state=active]:text-[#e30613] data-[state=active]:bg-white data-[state=active]:shadow-none transition-all border-b-2 border-transparent data-[state=active]:border-[#e30613] rounded-none hover:text-neutral-700"
          >
            {isAr ? "الشحن والتركيب" : "Shipping & Installation"}
          </TabsTrigger>
        </TabsList>

        <div className="p-6 sm:p-10">
          <TabsContent value="specs" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {specs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex flex-col gap-1 pb-4 border-b border-neutral-50 last:border-0 md:even:border-r md:even:border-b-0 md:even:pr-8 md:even:pl-0 md:odd:border-b-0 md:odd:pb-0"
                  >
                    <span className="text-[#e30613] text-[10px] sm:text-xs font-black uppercase tracking-wider">{spec.label}</span>
                    <span className="font-bold text-neutral-900 text-base sm:text-xl leading-relaxed">{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-400">
                <p className="text-sm font-medium">
                  {isAr
                    ? "لا توجد مواصفات فنية إضافية لهذا المنتج"
                    : "No additional technical specifications recorded"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sizes" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {sizeInfo ? (
              <div className="max-w-3xl">
                 <div className="flex flex-col gap-2">
                    <span className="text-[#e30613] text-[10px] sm:text-xs font-black uppercase tracking-wider">{isAr ? "الأبعاد التفصيلية" : "Detailed Dimensions"}</span>
                    <div className="bg-neutral-50 border border-neutral-100 p-8 sm:p-12 rounded-2xl text-center">
                      <p className="text-2xl sm:text-4xl font-black text-neutral-900 leading-tight">{sizeInfo}</p>
                      <p className="text-[10px] text-neutral-400 mt-4 uppercase tracking-widest font-bold">
                         {isAr ? "المقاس الفعلي للمنتج" : "Actual Product Dimensions"}
                      </p>
                    </div>
                  </div>
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-400">
                <p className="text-sm font-medium">
                  {isAr
                    ? "يرجى اختيار البديل (المقاس) من الخيارات المتاحة لرؤية الأبعاد"
                    : "Please select a variant dimensions to see details"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shipping" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-10">
              {/* Product Specific Delivery Info */}
              {productDeliveryInfo && (
                <div className="flex flex-col gap-2 pb-6 border-b border-neutral-100">
                  <span className="text-[#e30613] text-[10px] sm:text-xs font-black uppercase tracking-wider">{isAr ? "التوصيل والتركيب" : "Shipping & Installation"}</span>
                  <p className="text-neutral-900 text-base sm:text-xl font-bold leading-relaxed whitespace-pre-wrap">
                    {productDeliveryInfo}
                  </p>
                </div>
              )}

              {/* General Policies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                {shippingPolicy && (
                  <div className="space-y-2">
                     <span className="text-[#e30613] text-[10px] sm:text-xs font-black uppercase tracking-wider">{isAr ? "سياسة الشحن" : "Shipping Policy"}</span>
                      <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-bold">
                        {isAr ? shippingPolicy.contentAr : shippingPolicy.contentEn}
                      </p>
                  </div>
                )}
                
                {installPolicy && (
                  <div className="space-y-2">
                     <span className="text-[#e30613] text-[10px] sm:text-xs font-black uppercase tracking-wider">{isAr ? "خدمة التركيب" : "Installation"}</span>
                      <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-bold">
                        {isAr ? installPolicy.contentAr : installPolicy.contentEn}
                      </p>
                  </div>
                )}
              </div>

              {!productDeliveryInfo && !shippingPolicy && !installPolicy && (
                <div className="text-center py-12 text-neutral-400">
                  <Truck className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#e30613]" />
                  <p className="text-sm font-bold">
                    {isAr
                      ? "تواصل معنا مباشرة عبر واتساب لمعرفة تفاصيل الشحن والتركيب"
                      : "Please contact our support via WhatsApp for shipping rates and details"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
