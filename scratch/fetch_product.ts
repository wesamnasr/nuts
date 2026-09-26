import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findUnique({
    where: { id: '5108aa32-3955-4e7f-a6ea-5607ac4efebd' },
    include: {
      variants: true,
      images: true,
      category: true
    }
  });
  console.log(JSON.stringify(product, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
