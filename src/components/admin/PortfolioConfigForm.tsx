"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useLocale } from "@/i18n/LocaleContext";
import { updatePortfolioConfig, type PortfolioStat } from "@/actions/portfolio-config";
import { Loader2, Save, Edit2 } from "lucide-react";
import { useState } from "react";

const statSchema = z.object({
  id: z.union([z.string(), z.number()]),
  value: z.string().min(1, "Value is required"),
  labelAr: z.string().min(1, "Arabic Label is required"),
  labelEn: z.string().min(1, "English Label is required"),
});

const formSchema = z.object({
  heroTitleAr: z.string().min(1, "Arabic Title is required"),
  heroTitleEn: z.string().min(1, "English Title is required"),
  heroDescAr: z.string().min(1, "Arabic Description is required"),
  heroDescEn: z.string().min(1, "English Description is required"),
  showStats: z.boolean().default(true),
  stats: z.array(statSchema),
});

interface PortfolioConfigFormProps {
  initialConfig: any;
}

export function PortfolioConfigForm({ initialConfig }: PortfolioConfigFormProps) {
  const { t, dir } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse stats if it comes as a string, otherwise use as is
  const parsedStats: PortfolioStat[] = typeof initialConfig?.stats === 'string' 
    ? JSON.parse(initialConfig.stats) 
    : initialConfig?.stats || [
        { id: 1, value: "+500", labelAr: "مشروع تم تنفيذه", labelEn: "Projects Completed" },
        { id: 2, value: "10", labelAr: "سنوات خبرة", labelEn: "Years of Experience" },
        { id: 3, value: "100%", labelAr: "خشب طبيعي", labelEn: "Natural Wood" },
        { id: 4, value: "+15k", labelAr: "عميل سعيد", labelEn: "Happy Clients" }
      ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      heroTitleAr: initialConfig?.heroTitleAr || "",
      heroTitleEn: initialConfig?.heroTitleEn || "",
      heroDescAr: initialConfig?.heroDescAr || "",
      heroDescEn: initialConfig?.heroDescEn || "",
      showStats: (initialConfig?.showStats ?? true) as boolean,
      stats: parsedStats,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await updatePortfolioConfig(values);
      if (result.success) {
        toast.success("Portfolio settings updated successfully");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border shadow-sm pb-24 lg:pb-8" dir={dir}>
        
        <div className="flex items-center gap-3 sm:gap-4 border-b pb-6">
            <div className="p-2.5 sm:p-3 bg-neutral-100 rounded-xl sm:rounded-2xl">
                <Edit2 className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600" />
            </div>
            <div>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900">{t("pageContent")}</h2>
                <p className="text-xs sm:text-sm text-neutral-500">{t("pageContentDesc")}</p>
            </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 sm:mb-4 bg-neutral-50 p-2 rounded-lg">{t("heroSection")}</h3>
          </div>

          <FormField
            control={form.control}
            name="heroTitleAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">{t("heroTitleArLabel")}</FormLabel>
                <FormControl>
                  <Input {...field} dir="rtl" className="h-11 sm:h-12 font-cairo text-sm sm:text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heroTitleEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">{t("heroTitleEnLabel")}</FormLabel>
                <FormControl>
                  <Input {...field} dir="ltr" className="h-11 sm:h-12 font-serif text-sm sm:text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heroDescAr"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-xs sm:text-sm">{t("heroDescArLabel")}</FormLabel>
                <FormControl>
                  <Textarea {...field} dir="rtl" className="min-h-[80px] sm:min-h-[100px] font-cairo leading-relaxed text-sm sm:text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

           <FormField
            control={form.control}
            name="heroDescEn"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-xs sm:text-sm">{t("heroDescEnLabel")}</FormLabel>
                <FormControl>
                  <Textarea {...field} dir="ltr" className="min-h-[80px] sm:min-h-[100px] leading-relaxed text-sm sm:text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Stats Section */}
        <div className="space-y-6">
          <div className="col-span-2 flex items-center justify-between bg-neutral-50 p-4 rounded-xl">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-1">{t("statisticsBar")}</h3>
              <p className="text-xs text-neutral-500">إظهار أو إخفاء شريط الإحصائيات في صفحة أعمالنا</p>
            </div>
            <FormField
              control={form.control}
              name="showStats"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormLabel className="text-sm font-bold cursor-pointer">
                    {field.value ? "مرئي" : "مخفي"}
                  </FormLabel>
                  <FormControl>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          {form.watch("showStats") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(form.watch("stats") as any[]).map((_: any, index: number) => (
               <div key={index} className="space-y-4 p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-neutral-200 rounded-full text-[10px] sm:text-xs font-bold text-neutral-600">
                        {index + 1}
                     </span>
                     <span className="text-[10px] sm:text-xs font-bold uppercase text-neutral-400">{t("statItem")}</span>
                  </div>

                  <FormField
                    control={form.control}
                    name={`stats.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] sm:text-xs">{t("statValueLabel")}</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-9 sm:h-10 bg-white text-xs sm:text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`stats.${index}.labelAr`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] sm:text-xs">{t("statLabelAr")}</FormLabel>
                        <FormControl>
                          <Input {...field} dir="rtl" className="h-9 sm:h-10 bg-white font-cairo text-xs sm:text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`stats.${index}.labelEn`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] sm:text-xs">{t("statLabelEn")}</FormLabel>
                        <FormControl>
                          <Input {...field} dir="ltr" className="h-9 sm:h-10 bg-white text-xs sm:text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
               </div>
            ))}
          </div>
          )}
        </div>

        {/* DESKTOP SAVE BUTTON */}
        <div className="hidden lg:flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting} className="h-12 px-8 min-w-[150px] bg-primary hover:bg-primary/90 rounded-xl text-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2 group">
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            {t("saveChanges")}
          </Button>
        </div>

        {/* MOBILE SAVE BUTTON (FIXED) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {t("saveChanges")}
          </Button>
        </div>
      </form>
    </Form>
  );
}


