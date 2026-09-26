"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  updateSettings,
  updatePolicy,
  type SettingsMap,
  type PolicyData,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  FileText,
  CreditCard,
  Search,
  MessageCircle,
  Music2,
  Ghost,
  Facebook,
  Instagram,
  MapPin,
  Navigation,
  Save,
  Loader2,
  CheckCircle2,
  Upload,
  X,
  Phone,
  Globe,
  Store,
  Truck,
  RotateCcw,
  Wrench,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";

interface SettingsFormProps {
  settings: SettingsMap;
  policies: PolicyData[];
}

type TabKey = "general" | "policies" | "social" | "installment" | "seo";

const POLICY_META: Record<
  string,
  { label: string; labelAr: string; icon: React.ReactNode }
> = {
  SHIPPING: {
    label: "Shipping Policy",
    labelAr: "سياسة الشحن",
    icon: <Truck className="h-5 w-5" />,
  },
  RETURN: {
    label: "Return & Exchange",
    labelAr: "الاستبدال والاسترجاع",
    icon: <RotateCcw className="h-5 w-5" />,
  },
  INSTALLATION: {
    label: "Installation Policy",
    labelAr: "سياسة التركيب",
    icon: <Wrench className="h-5 w-5" />,
  },
};

export function SettingsForm({ settings, policies }: SettingsFormProps) {
  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { t, dir, locale } = useLocale();
  const isRtl = dir === "rtl";
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "general", label: t("tabGeneral"), icon: <Settings className="h-4 w-4" /> },
    {
      key: "policies",
      label: t("tabPolicies"),
      icon: <FileText className="h-4 w-4" />,
    },
    {
      key: "social",
      label: t("tabSocialAndLocation"),
      icon: <Globe className="h-4 w-4" />,
    },
    {
      key: "installment",
      label: t("tabInstallment"),
      icon: <CreditCard className="h-4 w-4" />,
    },
    { key: "seo", label: t("tabSEO"), icon: <Search className="h-4 w-4" /> },
  ];

  // General state
  const [storeNameEn, setStoreNameEn] = useState(
    settings.storeNameEn || "FURNITURE STORE"
  );
  const [storeNameAr, setStoreNameAr] = useState(
    settings.storeNameAr || "أثاث فاخر"
  );
  const [customerSupportNumber, setCustomerSupportNumber] = useState(
    settings.customerSupportNumber || "+966500000000"
  );
  const [salesNumber, setSalesNumber] = useState(
    settings.salesNumber || "+966500000000"
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    settings.logoUrl || null
  );

  // Policies state
  const [policyData, setPolicyData] = useState<
    Record<string, { contentEn: string; contentAr: string }>
  >(() => {
    const map: Record<string, { contentEn: string; contentAr: string }> = {};
    for (const p of policies) {
      map[p.type] = { contentEn: p.contentEn, contentAr: p.contentAr };
    }
    // Fill missing
    for (const type of ["SHIPPING", "RETURN", "INSTALLATION"]) {
      if (!map[type]) map[type] = { contentEn: "", contentAr: "" };
    }
    return map;
  });

  // Installment state
  const [installmentInfoEn, setInstallmentInfoEn] = useState(
    settings.installmentInfoEn || ""
  );
  const [installmentInfoAr, setInstallmentInfoAr] = useState(
    settings.installmentInfoAr || ""
  );

  // SEO state
  const [metaTitle, setMetaTitle] = useState(settings.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    settings.metaDescription || ""
  );

  // Social & Location state
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl || "");
  const [tiktokUrl, setTiktokUrl] = useState(settings.tiktokUrl || "");
  const [snapchatUrl, setSnapchatUrl] = useState(settings.snapchatUrl || "");
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl || "");
  const [whatsappUrl, setWhatsappUrl] = useState(settings.whatsappUrl || "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(settings.googleMapsUrl || "");
  const [mapCoordinates, setMapCoordinates] = useState(settings.mapCoordinates || "");
  const [storeAddressEn, setStoreAddressEn] = useState(settings.storeAddressEn || "");
  const [storeAddressAr, setStoreAddressAr] = useState(settings.storeAddressAr || "");

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // WhatsApp validation
  const isCustomerSupportValid =
    /^\+\d{10,15}$/.test(customerSupportNumber.replace(/\s/g, ""));
  const isSalesValid =
    /^\+\d{10,15}$/.test(salesNumber.replace(/\s/g, ""));

  // Logo handlers
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError(locale === "ar" ? "يجب أن يكون حجم الشعار أقل من 2 ميجابايت" : "Logo must be under 2MB");
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // Policy change handler
  const handlePolicyChange = (
    type: string,
    lang: "contentEn" | "contentAr",
    value: string
  ) => {
    setPolicyData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [lang]: value },
    }));
  };

  // Save ALL settings
  const handleSaveGeneral = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Validate WhatsApp
      if (!isCustomerSupportValid || !isSalesValid) {
        setError(
          locale === "ar" 
            ? "يجب أن تبدأ أرقام الهاتف بـ + وكود الدولة (مثال: +201234567890)" 
            : "Phone numbers must start with + and country code (e.g. +201234567890)"
        );
        setIsSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("storeNameEn", storeNameEn);
      formData.append("storeNameAr", storeNameAr);
      formData.append("customerSupportNumber", customerSupportNumber);
      formData.append("salesNumber", salesNumber);
      formData.append("installmentInfoEn", installmentInfoEn);
      formData.append("installmentInfoAr", installmentInfoAr);
      formData.append("metaTitle", metaTitle);
      formData.append("metaDescription", metaDescription);

      // Social & Location
      formData.append("instagramUrl", instagramUrl);
      formData.append("tiktokUrl", tiktokUrl);
      formData.append("snapchatUrl", snapchatUrl);
      formData.append("facebookUrl", facebookUrl);
      formData.append("whatsappUrl", whatsappUrl);
      formData.append("googleMapsUrl", googleMapsUrl);
      formData.append("mapCoordinates", mapCoordinates);
      formData.append("storeAddressEn", storeAddressEn);
      formData.append("storeAddressAr", storeAddressAr);

      if (logoFile) {
        formData.append("logo", logoFile);
      } else if (!logoPreview) {
        formData.append("logoUrl", "");
      }

      const result = await updateSettings(formData);
      if (!result.success) {
        setError(result.error || (locale === "ar" ? "فشل حفظ الإعدادات" : "Failed to save settings"));
        setIsSaving(false);
        return;
      }

      // Save policies
      for (const type of ["SHIPPING", "RETURN", "INSTALLATION"] as const) {
        const pd = policyData[type];
        if (pd) {
          const policyResult = await updatePolicy(
            type,
            pd.contentEn,
            pd.contentAr
          );
          if (!policyResult.success) {
            setError(locale === "ar" ? `فشل حفظ سياسة ${POLICY_META[type].labelAr}` : `Failed to save ${type} policy`);
            setIsSaving(false);
            return;
          }
        }
      }

      setSuccessMsg(t("settingsSaved"));
      router.refresh();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setError(locale === "ar" ? "حدث خطأ غير متوقع." : "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-0 space-y-6 sm:space-y-8 pb-32 lg:pb-10" dir={dir}>
      {/* Status Banners */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-red-800">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className={cn("hover:text-red-600 text-red-400", isRtl ? "mr-auto" : "ml-auto")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-800">{successMsg}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black tracking-tight transition-all whitespace-nowrap uppercase ${
              activeTab === tab.key
                ? "bg-[#FF7F11] text-white shadow-xl shadow-[#FF7F11]/30 -translate-y-0.5"
                : "bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 active:scale-[0.98]"
            }`}
          >
            <span className={cn(activeTab === tab.key ? "text-white" : "text-neutral-400")}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================= TAB: GENERAL ============================= */}
      {activeTab === "general" && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
          {/* Store Identity */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] border shadow-sm p-5 sm:p-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <h2 className="text-base sm:text-xl font-black text-neutral-900 uppercase tracking-tight font-playfair">
                  {t("storeIdentity")}
                </h2>
                <p className="text-[10px] sm:text-sm text-neutral-500 font-medium opacity-80 mt-0.5 leading-tight">
                  {t("storeIdentityDesc")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-neutral-400">
                  {t("storeNameEnLabel")}
                </Label>
                <Input
                  value={storeNameEn}
                  onChange={(e) => setStoreNameEn(e.target.value)}
                  placeholder="e.g. Premium Furniture"
                  className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-neutral-200 focus:ring-primary/20 transition-all font-bold"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2" dir="rtl">
                <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-neutral-400 font-cairo">
                  {t("storeNameArLabel")}
                </Label>
                <Input
                  value={storeNameAr}
                  onChange={(e) => setStoreNameAr(e.target.value)}
                  placeholder="مثال: أثاث فاخر"
                  className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-neutral-200 focus:ring-primary/20 transition-all font-black font-cairo"
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] border shadow-sm p-5 sm:p-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-amber-50 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <h2 className="text-base sm:text-xl font-black text-neutral-900 uppercase tracking-tight font-playfair">
                  {t("storeLogo")}
                </h2>
                <p className="text-[10px] sm:text-sm text-neutral-500 font-medium opacity-80 mt-0.5 leading-tight">
                  {t("storeLogoDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              {logoPreview ? (
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-neutral-200 bg-neutral-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview}
                      alt="Store logo"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className={cn(
                        "absolute -top-2 h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors",
                        isRtl ? "-left-2" : "-right-2"
                    )}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-32 h-32 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 hover:bg-neutral-100 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
                >
                  <Upload className="h-6 w-6 text-neutral-400 group-hover:text-primary transition-colors" />
                  <span className="text-xs text-neutral-400 group-hover:text-neutral-600">
                    {t("uploadLogo")}
                  </span>
                </button>
              )}
              <div className={cn("text-sm text-neutral-500 pt-2", isRtl ? "text-right" : "text-left")}>
                <p className="font-medium text-neutral-700 mb-1">
                  {t("logoRecommended")}
                </p>
                <p>PNG, JPG, or WebP · Max 2MB</p>
                <p className="text-xs text-neutral-400 mt-2">
                   {locale === "ar" ? "يتم تحويله تلقائياً لـ WebP للأداء" : "Auto-converted to WebP for performance"}
                </p>
              </div>
            </div>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoSelect}
              className="hidden"
            />
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-3xl border shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <h2 className="text-lg font-bold text-neutral-900">
                  {t("whatsappContact")}
                </h2>
                <p className="text-sm text-neutral-500">
                  {t("whatsappContactDesc")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t("customerSupportNumber")}</Label>
                <Input
                  value={customerSupportNumber}
                  onChange={(e) => setCustomerSupportNumber(e.target.value)}
                  placeholder="+201234567890"
                  className={`h-12 rounded-xl font-mono ${
                    customerSupportNumber.length > 3 && !isCustomerSupportValid
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                      : ""
                  }`}
                  dir="ltr"
                />
                {customerSupportNumber.length > 3 && !isCustomerSupportValid && (
                  <p className="text-xs text-red-500 font-medium">
                    {locale === "ar" ? "صيغة غير صحيحة" : "Invalid format"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t("salesNumber")}</Label>
                <Input
                  value={salesNumber}
                  onChange={(e) => setSalesNumber(e.target.value)}
                  placeholder="+201234567890"
                  className={`h-12 rounded-xl font-mono ${
                    salesNumber.length > 3 && !isSalesValid
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                      : ""
                  }`}
                  dir="ltr"
                />
                {salesNumber.length > 3 && !isSalesValid && (
                  <p className="text-xs text-red-500 font-medium">
                    {locale === "ar" ? "صيغة غير صحيحة" : "Invalid format"}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-4">
              Format: +{"{country code}"}{"{number}"} — e.g. +201234567890
            </p>
          </div>
        </div>
      )}

      {/* ============================= TAB: POLICIES ============================= */}
      {activeTab === "policies" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {(["SHIPPING", "RETURN", "INSTALLATION"] as const).map((type) => {
            const meta = POLICY_META[type];
            const data = policyData[type] || { contentEn: "", contentAr: "" };
            return (
              <div
                key={type}
                className="bg-white rounded-2xl sm:rounded-[2rem] border shadow-sm p-5 sm:p-8"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    {meta.icon}
                  </div>
                  <div className={isRtl ? "text-right" : "text-left"}>
                    <h2 className="text-base sm:text-xl font-black text-neutral-900 uppercase tracking-tight font-playfair">
                      {locale === "ar" ? meta.labelAr : meta.label}
                    </h2>
                    <p className="text-[10px] sm:text-sm text-neutral-500 font-medium opacity-80 mt-0.5 leading-tight">
                      {locale === "ar" ? meta.label : meta.labelAr}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" />
                      {locale === "ar" ? "المحتوى بالإنجليزي" : "English Content"}
                    </Label>
                    <textarea
                      value={data.contentEn}
                      onChange={(e) =>
                        handlePolicyChange(type, "contentEn", e.target.value)
                      }
                      rows={5}
                      placeholder="Enter policy text in English..."
                      className="w-full rounded-xl border border-neutral-200 p-4 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2" dir="rtl">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" />
                      {locale === "ar" ? "المحتوى بالعربي" : "Arabic Content"}
                    </Label>
                    <textarea
                      value={data.contentAr}
                      onChange={(e) =>
                        handlePolicyChange(type, "contentAr", e.target.value)
                      }
                      rows={5}
                      placeholder="أدخل نص السياسة بالعربي..."
                      className="w-full rounded-xl border border-neutral-200 p-4 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none font-cairo"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}



      {/* ============================= TAB: SOCIAL & LOCATION ============================= */}
      {activeTab === "social" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Social Links */}
          <div className="bg-white rounded-3xl border shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-pink-50 flex items-center justify-center">
                <Globe className="h-5 w-5 text-pink-600" />
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <h2 className="text-lg font-bold text-neutral-900">
                  {t("socialLinks")}
                </h2>
                <p className="text-sm text-neutral-500">
                  {t("socialLinksDesc")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  {t("instagramLabel")}
                </Label>
                <Input
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/yourstore"
                  className="h-12 rounded-xl"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Music2 className="h-4 w-4 text-neutral-900" />
                  {t("tiktokLabel")}
                </Label>
                <Input
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/@yourstore"
                  className="h-12 rounded-xl"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Ghost className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  {t("snapchatLabel")}
                </Label>
                <Input
                  value={snapchatUrl}
                  onChange={(e) => setSnapchatUrl(e.target.value)}
                  placeholder="https://snapchat.com/add/yourstore"
                  className="h-12 rounded-xl"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  {t("facebookLabel")}
                </Label>
                <Input
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/yourstore"
                  className="h-12 rounded-xl"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  {t("whatsappLink")}
                </Label>
                <Input
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  placeholder="https://wa.me/966500000000"
                  className="h-12 rounded-xl font-mono"
                  dir="ltr"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  {locale === "ar" ? "الرابط المباشر الذي يفتح تطبيق الواتساب فوراً." : "The direct link that opens the WhatsApp app immediately."}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-3xl border shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <h2 className="text-lg font-bold text-neutral-900">
                  {t("locationSettings")}
                </h2>
                <p className="text-sm text-neutral-500">
                  {t("locationSettingsDesc")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    {t("addressEnLabel")}
                  </Label>
                  <Input
                    value={storeAddressEn}
                    onChange={(e) => setStoreAddressEn(e.target.value)}
                    placeholder="e.g. Al Makarunah St, Ar Rabwah, Jeddah"
                    className="h-12 rounded-xl"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2" dir="rtl">
                  <Label className="text-sm font-semibold">
                    {t("addressArLabel")}
                  </Label>
                  <Input
                    value={storeAddressAr}
                    onChange={(e) => setStoreAddressAr(e.target.value)}
                    placeholder="مثال: شارع المكرونة، حي الربوة، جدة"
                    className="h-12 rounded-xl font-cairo"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    {t("googleMapsLink")}
                  </Label>
                  <Input
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    placeholder="https://www.google.com/maps/dir/?api=1&destination=..."
                    className="h-12 rounded-xl"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t("mapCoordsLabel")}
                  </Label>
                  <Input
                    value={mapCoordinates}
                    onChange={(e) => setMapCoordinates(e.target.value)}
                    placeholder="21.484635, 39.186066"
                    className="h-12 rounded-xl font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Map Preview Warning */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 space-y-1">
                  <p className="font-bold">{locale === "ar" ? "تأكد من دقة الإحداثيات" : "Ensure Coordinates Accuracy"}</p>
                  <p>
                    {locale === "ar" 
                      ? "إحداثيات الخريطة يجب أن تكون بنسق (Lat, Lng). أي خطأ سيؤدي لعدم ظهور الموقع بشكل صحيح للعملاء." 
                      : "Map coordinates must be in (Lat, Lng) format. Any error will prevent the location from displaying correctly to customers."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================= TAB: INSTALLMENT ============================= */}
      {activeTab === "installment" && (
        <div className="animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-violet-600" />
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <h2 className="text-lg font-bold text-neutral-900">
                   {t("installmentInfo")}
                </h2>
                <p className="text-sm text-neutral-500">
                  {t("installmentInfoDesc")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {locale === "ar" ? "معلومات التقسيط (إنجليزي)" : "Installment Info (English)"}
                </Label>
                <textarea
                  value={installmentInfoEn}
                  onChange={(e) => setInstallmentInfoEn(e.target.value)}
                  rows={4}
                  placeholder="e.g. Available in 3 monthly installments with 0% interest via ValU."
                  className="w-full rounded-xl border border-neutral-200 p-4 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2" dir="rtl">
                <Label className="text-sm font-semibold">
                  {locale === "ar" ? "معلومات التقسيط (عربي)" : "Installment Info (Arabic)"}
                </Label>
                <textarea
                  value={installmentInfoAr}
                  onChange={(e) => setInstallmentInfoAr(e.target.value)}
                  rows={4}
                  placeholder="مثال: متاح التقسيط على 3 أشهر بدون فوائد عبر ڤاليو."
                  className="w-full rounded-xl border border-neutral-200 p-4 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none font-cairo"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Preview */}
            {(installmentInfoEn || installmentInfoAr) && (
              <div className="mt-6 bg-violet-50 rounded-xl p-4 border border-violet-100">
                <p className={cn("text-xs text-violet-400 uppercase font-semibold tracking-wider mb-2", isRtl ? "text-right" : "text-left")}>
                  {locale === "ar" ? "معاينة المتجر" : "Storefront Preview"}
                </p>
                <div className={cn("flex items-center gap-2 text-sm text-violet-800", isRtl ? "flex-row-reverse" : "flex-row")}>
                  <CreditCard className="h-4 w-4" />
                  <span>{locale === "ar" ? (installmentInfoAr || installmentInfoEn) : (installmentInfoEn || installmentInfoAr)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================= TAB: SEO ============================= */}
      {activeTab === "seo" && (
        <div className="animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Search className="h-5 w-5 text-emerald-600" />
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <h2 className="text-lg font-bold text-neutral-900">
                  {t("seoConfig")}
                </h2>
                <p className="text-sm text-neutral-500">
                  {t("seoConfigDesc")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {t("metaTitleLabel")}
                </Label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="e.g. Premium Furniture Store | Cairo, Egypt"
                  className="h-12 rounded-xl"
                  maxLength={60}
                />
                <p className={cn("text-xs text-neutral-400", isRtl ? "text-left" : "text-right")}>
                  {metaTitle.length}/60 {locale === "ar" ? "حرف" : "characters"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {t("metaDescriptionLabel")}
                </Label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  placeholder="e.g. Discover handcrafted luxury furniture for your living room, bedroom and dining. Free delivery in Cairo."
                  className="w-full rounded-xl border border-neutral-200 p-4 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  maxLength={160}
                />
                <p className={cn("text-xs text-neutral-400", isRtl ? "text-left" : "text-right")}>
                  {metaDescription.length}/160 {locale === "ar" ? "حرف" : "characters"}
                </p>
              </div>

              {/* Google Preview */}
              {metaTitle && (
                <div className="bg-neutral-50 rounded-xl p-6 border border-dashed border-neutral-200">
                  <p className={cn("text-xs text-neutral-400 uppercase font-semibold tracking-wider mb-3", isRtl ? "text-right" : "text-left")}>
                    {locale === "ar" ? "معاينة جوجل" : "Google Preview"}
                  </p>
                  <div className={cn("max-w-lg", isRtl ? "text-right" : "text-left")}>
                    <p className="text-blue-700 text-lg font-medium truncate hover:underline cursor-pointer">
                      {metaTitle || "Your Store Title"}
                    </p>
                    <p className="text-green-700 text-sm truncate">
                      yourstore.com
                    </p>
                    <p className="text-sm text-neutral-600 line-clamp-2 mt-1">
                      {metaDescription ||
                        (locale === "ar" ? "أضف وصف ميتا للتحكم في كيفية ظهور متجرك في نتائج بحث Google." : "Add a meta description to control how your store appears in Google search results.")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================= SAVE BUTTON ============================= */}
      {/* DESKTOP ACTIONS */}
      <div className="hidden lg:flex justify-end pt-8 border-t border-neutral-100">
        <Button 
          type="button" 
          onClick={handleSaveGeneral}
          disabled={isSaving}
          className="bg-[#FF7F11] hover:bg-[#e56e00] text-white min-w-[200px] h-14 rounded-2xl text-base font-black uppercase tracking-tight shadow-xl shadow-[#FF7F11]/30 transition-all hover:shadow-2xl active:scale-[0.98] gap-3"
        >
          {isSaving ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Save className="w-6 h-6" />
              {t("saveSettings")}
            </>
          )}
        </Button>
      </div>

      {/* MOBILE ACTIONS (FIXED) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex gap-4">
        <Button 
          type="button" 
          variant="outline" 
          disabled={isSaving}
          onClick={() => router.refresh()}
          className="flex-1 h-14 rounded-2xl font-black uppercase tracking-tight border-neutral-200 text-neutral-500 text-sm active:scale-[0.98]"
        >
          {isRtl ? "إعادة تعيين" : "Reset"}
        </Button>
        <Button 
          type="button" 
          onClick={handleSaveGeneral}
          disabled={isSaving} 
          className="flex-2 h-14 bg-[#FF7F11] hover:bg-[#e56e00] text-white rounded-2xl font-black uppercase tracking-tight shadow-xl shadow-[#FF7F11]/30 text-sm active:scale-[0.98] gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isRtl ? "حفظ" : "Save"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
