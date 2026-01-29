-- CreateEnum
CREATE TYPE "InsuranceTypeEnum" AS ENUM ('CAR', 'HEALTH', 'LIFE');

-- CreateTable
CREATE TABLE "InsurancePlan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "insuranceType" "InsuranceTypeEnum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsurancePlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePlan_name_insuranceType_key" ON "InsurancePlan"("name", "insuranceType");
