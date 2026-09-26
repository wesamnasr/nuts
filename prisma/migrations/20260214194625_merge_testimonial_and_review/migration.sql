-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "commentAr" TEXT,
ADD COLUMN     "commentEn" TEXT,
ADD COLUMN     "customerImage" TEXT,
ADD COLUMN     "customerRoleAr" TEXT,
ADD COLUMN     "customerRoleEn" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Review_isFeatured_idx" ON "Review"("isFeatured");
