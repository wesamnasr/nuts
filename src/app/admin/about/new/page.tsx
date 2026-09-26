import { AboutSectionForm } from "@/components/admin/AboutSectionForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | New About Section",
};

export default function NewAboutSectionPage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-8 max-w-4xl">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Add New Section</h1>
            <p className="text-neutral-500 mt-2">Create a new section for the about page.</p>
        </div>
      <AboutSectionForm />
    </div>
  );
}
