-- CreateEnum
CREATE TYPE "CompanyTypeEnum" AS ENUM ('SOLIDARITY', 'COMMERCIAL');

-- CreateTable
CREATE TABLE "InsuranceCompany" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "email" TEXT NOT NULL,
    "companyType" "CompanyTypeEnum" NOT NULL,
    "insuranceTypes" "InsuranceTypeEnum"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPlan" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "features" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_name_key" ON "InsuranceCompany"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_email_key" ON "InsuranceCompany"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPlan_companyId_planId_key" ON "CompanyPlan"("companyId", "planId");

-- AddForeignKey
ALTER TABLE "CompanyPlan" ADD CONSTRAINT "CompanyPlan_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPlan" ADD CONSTRAINT "CompanyPlan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
