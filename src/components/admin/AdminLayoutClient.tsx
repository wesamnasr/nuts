"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function AdminLayoutClient({
  children,
  logoUrl,
}: {
  children: React.ReactNode;
  logoUrl?: string;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { dir } = useLocale();
  const isRtl = dir === "rtl";
  const pathname = usePathname();
  
  const isLoginPage = pathname.endsWith("/admin/login");

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col lg:flex-row" dir={dir}>
      <AdminSidebar 
        logoUrl={logoUrl} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className={cn(
          "flex-1 p-4 sm:p-6 md:p-8 transition-all duration-300",
          isRtl ? "lg:mr-64" : "lg:ml-64"
        )}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
