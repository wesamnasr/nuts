import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const settings = {
    storeNameEn: "New Concept",
    storeNameAr: "نيو كونسبت",
    metaTitle: "New Concept | نيو كونسبت",
    metaDescription: "Modern Furniture & Decor | أثاث وديكور عصري",
  };

  console.log("Updating settings...");

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    console.log(`Updated ${key} -> ${value}`);
  }

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
