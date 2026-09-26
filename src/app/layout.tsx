import type { Metadata } from "next";
import { Alexandria } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/i18n/LocaleContext";
import { getSettings } from "@/actions/settings";
import { Toaster } from "sonner";

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// Dynamic metadata from store settings
export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSettings();
    return {
      title: settings.metaTitle || "New Concept",
      description:
        settings.metaDescription || "Modern Furniture & Decor | أثاث وديكور عصري",
      icons: {
        icon: "/6@4x.png",
        apple: settings.logoUrl || "/6@4x.png",
      },
    };
  } catch {
    return {
      title: "New Concept",
      description: "Modern Furniture & Decor | أثاث وديكور عصري",
    };
  }
}

import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${alexandria.variable} antialiased`}
        suppressHydrationWarning
      >
        <LocaleProvider>
          {children}
          <WhatsAppButton 
            salesNumber={settings.salesNumber} 
            customerSupportNumber={settings.customerSupportNumber} 
          />
          <Toaster position="top-center" richColors />
        </LocaleProvider>
      </body>
    </html>
  );
}
