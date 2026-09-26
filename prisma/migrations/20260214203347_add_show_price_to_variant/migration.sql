/*
  Warnings:

  - You are about to drop the `Testimonial` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "showPrice" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "Testimonial";
