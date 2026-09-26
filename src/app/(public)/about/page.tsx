import { getSettings, getPolicies } from "@/actions/settings";
import { getAboutSections } from "@/actions/about";
import { AboutClient } from "@/components/about/AboutClient";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSettings();
  const { data: sections } = await getAboutSections();
  const policies = await getPolicies();

  return (
    <AboutClient 
      settings={settings} 
      sections={sections || []} 
      policies={policies}
    />
  );
}
