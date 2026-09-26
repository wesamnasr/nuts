import { getAboutSections } from "@/actions/about";
import { AboutSectionForm } from "@/components/admin/AboutSectionForm";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Edit About Section",
};

interface EditAboutSectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAboutSectionPage({ params }: EditAboutSectionPageProps) {
  const { id } = await params;
  const { data: sections } = await getAboutSections();
  const section = sections?.find((s) => s.id === id);

  if (!section) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 max-w-4xl">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Edit Section</h1>
            <p className="text-neutral-500 mt-2">Update content for this about page section.</p>
        </div>
      <AboutSectionForm initialData={section} />
    </div>
  );
}
