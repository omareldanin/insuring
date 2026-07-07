-- DropForeignKey
ALTER TABLE "InsuranceDocument" DROP CONSTRAINT "InsuranceDocument_companyId_fkey";

-- DropForeignKey
ALTER TABLE "InsuranceDocument" DROP CONSTRAINT "InsuranceDocument_planId_fkey";

-- DropForeignKey
ALTER TABLE "InsuranceDocument" DROP CONSTRAINT "InsuranceDocument_userId_fkey";

-- DropForeignKey
ALTER TABLE "InsuranceDocumentCarInfo" DROP CONSTRAINT "InsuranceDocumentCarInfo_ruleId_fkey";

-- DropForeignKey
ALTER TABLE "InsuranceDocumentLifeInfo" DROP CONSTRAINT "InsuranceDocumentLifeInfo_ruleId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_ruleId_fkey";

-- AddForeignKey
ALTER TABLE "InsuranceDocument" ADD CONSTRAINT "InsuranceDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "InsuranceCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocument" ADD CONSTRAINT "InsuranceDocument_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocument" ADD CONSTRAINT "InsuranceDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentCarInfo" ADD CONSTRAINT "InsuranceDocumentCarInfo_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "CarRules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentLifeInfo" ADD CONSTRAINT "InsuranceDocumentLifeInfo_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "LifeRules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "HealthRules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
