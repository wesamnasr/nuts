import { getSettings, getPolicies } from "@/actions/settings";
import { SettingsClient } from "@/components/admin/SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, policies] = await Promise.all([
    getSettings(),
    getPolicies(),
  ]);

  return <SettingsClient settings={settings} policies={policies} />;
}
