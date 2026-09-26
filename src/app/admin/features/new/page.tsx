import { StoreFeatureForm } from "@/components/admin/StoreFeatureForm";

export default function NewStoreFeaturePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Add New Feature</h1>
        <p className="text-neutral-500 mt-2">
          Create a new "Why Choose Us" feature
        </p>
      </div>
      <StoreFeatureForm />
    </div>
  );
}
