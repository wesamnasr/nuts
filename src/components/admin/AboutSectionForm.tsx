"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/i18n/LocaleContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createAboutSection, updateAboutSection } from "@/actions/about";
import { Loader2, Save } from "lucide-react";
import { PortfolioMediaUpload } from "./PortfolioMediaUpload";

const formSchema = z.object({
  titleAr: z.string().min(1, "Arabic title is required"),
  titleEn: z.string().min(1, "English title is required"),
  descriptionAr: z.string().min(1, "Arabic description is required"),
  descriptionEn: z.string().min(1, "English description is required"),
  image: z.string().optional(),
});

interface AboutSectionFormProps {
  initialData?: {
    id: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    image: string | null;
  };
}

export function AboutSectionForm({ initialData }: AboutSectionFormProps) {
  const { t, dir } = useLocale();
  const isRtl = dir === "rtl";
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titleAr: initialData?.titleAr || "",
      titleEn: initialData?.titleEn || "",
      descriptionAr: initialData?.descriptionAr || "",
      descriptionEn: initialData?.descriptionEn || "",
      image: initialData?.image || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      if (initialData) {
        const result = await updateAboutSection(initialData.id, values);
        if (result.success) {
          toast.success("Section updated successfully");
          router.push("/admin/about");
          router.refresh();
        } else {
          toast.error("Failed to update section");
        }
      } else {
        const result = await createAboutSection(values);
        if (result.success) {
          toast.success("Section created successfully");
          router.push("/admin/about");
          router.refresh();
        } else {
          toast.error("Failed to create section");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 sm:p-6 md:p-0 space-y-6 sm:space-y-8 pb-24 lg:pb-0">
        <div className="p-4 sm:p-8 space-y-8 sm:space-y-10">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10">
            <FormField
              control={form.control}
              name="titleAr"
              render={({ field }) => (
                <FormItem className="space-y-3 text-right">
                  <FormLabel className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FF7F11] opacity-70 font-cairo">Title (Arabic)</FormLabel>
                  <FormControl>
                    <Input {...field} dir="rtl" className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-neutral-200 focus:ring-primary font-black font-cairo text-right tracking-tight" />
                  </FormControl>
                  <FormMessage className="text-[10px] sm:text-xs font-bold" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="titleEn"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FF7F11] opacity-70">Title (English)</FormLabel>
                  <FormControl>
                    <Input {...field} dir="ltr" className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-neutral-200 focus:ring-primary font-bold tracking-tight" />
                  </FormControl>
                  <FormMessage className="text-[10px] sm:text-xs font-bold" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptionAr"
              render={({ field }) => (
                <FormItem className="col-span-2 space-y-3 text-right">
                  <FormLabel className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FF7F11] opacity-70 font-cairo">Description (Arabic)</FormLabel>
                  <FormControl>
                    <Textarea {...field} dir="rtl" className="min-h-[120px] rounded-xl sm:rounded-2xl border-neutral-200 focus:ring-primary font-black font-cairo text-right leading-relaxed" />
                  </FormControl>
                  <FormMessage className="text-[10px] sm:text-xs font-bold" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptionEn"
              render={({ field }) => (
                <FormItem className="col-span-2 space-y-3">
                  <FormLabel className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FF7F11] opacity-70">Description (English)</FormLabel>
                  <FormControl>
                    <Textarea {...field} dir="ltr" className="min-h-[120px] rounded-xl sm:rounded-2xl border-neutral-200 focus:ring-primary font-medium leading-relaxed" />
                  </FormControl>
                  <FormMessage className="text-[10px] sm:text-xs font-bold" />
                </FormItem>
              )}
            />

            <div className="col-span-2 space-y-4">
                 <FormLabel className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FF7F11] opacity-70">Section Image (Optional)</FormLabel>
                 <PortfolioMediaUpload 
                      onChange={(url) => form.setValue("image", url)}
                      initialUrl={initialData?.image || undefined}
                      folder="about"
                      label={t("uploadImage")}
                 />
            </div>
          </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden lg:flex justify-end pt-8 border-t">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[#FF7F11] hover:bg-[#e56e00] text-white min-w-[200px] h-14 rounded-2xl font-black uppercase tracking-tight shadow-xl shadow-[#FF7F11]/30 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {initialData ? "Update Section" : "Save Section"}
          </Button>
        </div>
      </div>

        {/* MOBILE ACTIONS (FIXED) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] flex gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-tight border-neutral-200"
          >
            {t("cancel")}
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="flex-2 h-14 bg-[#FF7F11] hover:bg-[#e56e00] text-white rounded-2xl font-black uppercase tracking-tight shadow-xl shadow-[#FF7F11]/30 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-white" />
            ) : (
              initialData ? (isRtl ? "تحديث" : "Update") : (isRtl ? "حفظ" : "Save")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
