import { getSettings } from "@/actions/settings";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NewsletterSection } from "@/components/sections/NewsletterSection";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  const storeName = {
    en: settings.storeNameEn || "New Concept",
    ar: settings.storeNameAr || "نيو كونسبت",
  };

  const socialLinks = {
    whatsappUrl: settings.whatsappUrl,
    instagramUrl: settings.instagramUrl,
    tiktokUrl: settings.tiktokUrl,
    snapchatUrl: settings.snapchatUrl,
    facebookUrl: settings.facebookUrl,
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header
        storeName={storeName}
        salesNumber={settings.salesNumber || settings.whatsappNumber || undefined}
        logoUrl={settings.logoUrl}
      />

      <main className="flex-1">
        {children}
      </main>

      <NewsletterSection />

      <Footer
        storeName={storeName}
        logoUrl={settings.logoUrl}
        socialLinks={socialLinks}
        addressEn={settings.storeAddressEn}
        addressAr={settings.storeAddressAr}
      />
    </div>
  );
}
