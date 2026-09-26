
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables form .env file
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('Loaded .env file');
} else {
  console.error('.env file not found');
  process.exit(1);
}

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
    const existing = await prisma.setting.findUnique({ where: { key } });
    if (existing) {
        await prisma.setting.update({
            where: { key },
            data: { value },
        });
        console.log(`Updated ${key} -> ${value}`);
    } else {
        await prisma.setting.create({
            data: { key, value },
        });
        console.log(`Created ${key} -> ${value}`);
    }
  }

  console.log("Successfully updated store settings to New Concept.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
