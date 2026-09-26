-- AlterTable
ALTER TABLE "LandingPageConfig" ADD COLUMN     "manualFlashSaleIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
