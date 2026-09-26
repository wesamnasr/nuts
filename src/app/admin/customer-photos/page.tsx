import { getCustomerPhotos } from "@/actions/customer-photo";
import { CustomerPhotosClient } from "@/components/admin/CustomerPhotosClient";

export const dynamic = "force-dynamic";

export default async function CustomerPhotosPage() {
  const { data: photos = [] } = await getCustomerPhotos();

  return <CustomerPhotosClient photos={photos} />;
}
