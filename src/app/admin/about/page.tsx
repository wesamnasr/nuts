import { getAboutSections } from "@/actions/about";
import { AboutSectionsClient } from "@/components/admin/AboutSectionsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | About Page",
};

export default async function AdminAboutPage() {
  const { data: sections } = await getAboutSections();

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 max-w-7xl">
      <AboutSectionsClient sections={sections || []} />
    </div>
  );
}
