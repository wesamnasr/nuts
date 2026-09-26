-- CreateTable
CREATE TABLE "PortfolioConfig" (
    "id" TEXT NOT NULL,
    "heroTitleAr" TEXT,
    "heroTitleEn" TEXT,
    "heroDescAr" TEXT,
    "heroDescEn" TEXT,
    "stats" JSONB DEFAULT '[]',
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioConfig_pkey" PRIMARY KEY ("id")
);
