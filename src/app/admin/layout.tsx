import { getSettings } from "@/actions/settings";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <AdminLayoutClient logoUrl={settings.logoUrl}>
      {children}
    </AdminLayoutClient>
  );
}
