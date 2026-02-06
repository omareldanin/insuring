-- DropForeignKey
ALTER TABLE "CarRules" DROP CONSTRAINT "CarRules_insuranceCompanyId_fkey";

-- DropForeignKey
ALTER TABLE "HealthRules" DROP CONSTRAINT "HealthRules_insuranceCompanyId_fkey";

-- DropForeignKey
ALTER TABLE "LifeRules" DROP CONSTRAINT "LifeRules_insuranceCompanyId_fkey";

-- AddForeignKey
ALTER TABLE "HealthRules" ADD CONSTRAINT "HealthRules_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeRules" ADD CONSTRAINT "LifeRules_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarRules" ADD CONSTRAINT "CarRules_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;
