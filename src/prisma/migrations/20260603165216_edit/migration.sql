-- DropForeignKey
ALTER TABLE "InsuranceDocumentCarInfo" DROP CONSTRAINT "InsuranceDocumentCarInfo_insuranceDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "InsuranceDocumentHealthInfo" DROP CONSTRAINT "InsuranceDocumentHealthInfo_insuranceDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "InsuranceDocumentLifeInfo" DROP CONSTRAINT "InsuranceDocumentLifeInfo_insuranceDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_insuranceDocumentHealthInfoId_fkey";

-- AddForeignKey
ALTER TABLE "InsuranceDocumentCarInfo" ADD CONSTRAINT "InsuranceDocumentCarInfo_insuranceDocumentId_fkey" FOREIGN KEY ("insuranceDocumentId") REFERENCES "InsuranceDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentLifeInfo" ADD CONSTRAINT "InsuranceDocumentLifeInfo_insuranceDocumentId_fkey" FOREIGN KEY ("insuranceDocumentId") REFERENCES "InsuranceDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentHealthInfo" ADD CONSTRAINT "InsuranceDocumentHealthInfo_insuranceDocumentId_fkey" FOREIGN KEY ("insuranceDocumentId") REFERENCES "InsuranceDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_insuranceDocumentHealthInfoId_fkey" FOREIGN KEY ("insuranceDocumentHealthInfoId") REFERENCES "InsuranceDocumentHealthInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
