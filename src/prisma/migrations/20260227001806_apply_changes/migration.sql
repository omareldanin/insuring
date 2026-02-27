/*
  Warnings:

  - You are about to drop the column `link` on the `InsuranceCompany` table. All the data in the column will be lost.
  - You are about to drop the `InsuranceDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InsuranceDocumentCarInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InsuranceDocumentHealthInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InsuranceDocumentLifeInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InsuranceDocument" DROP CONSTRAINT "InsuranceDocument_companyId_fkey";

-- DropForeignKey
ALTER TABLE "InsuranceDocument" DROP CONSTRAINT "InsuranceDocument_planId_fkey";

-- DropForeignKey
ALTER TABLE "InsuranceDocument" DROP CONSTRAINT "InsuranceDocument_userId_fkey";

-- DropForeignKey
ALTER TABLE "InsuranceDocumentCarInfo" DROP CONSTRAINT "InsuranceDocumentCarInfo_carYearId_fkey";

-- DropForeignKey
ALTER TABLE "InsuranceDocumentCarInfo" DROP CONSTRAINT "InsuranceDocumentCarInfo_insuranceDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "InsuranceDocumentCarInfo" DROP CONSTRAINT "InsuranceDocumentCarInfo_ruleId_fkey";

-- DropForeignKey
ALTER TABLE "InsuranceDocumentHealthInfo" DROP CONSTRAINT "InsuranceDocumentHealthInfo_insuranceDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "InsuranceDocumentLifeInfo" DROP CONSTRAINT "InsuranceDocumentLifeInfo_insuranceDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "InsuranceDocumentLifeInfo" DROP CONSTRAINT "InsuranceDocumentLifeInfo_ruleId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_insuranceDocumentHealthInfoId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_ruleId_fkey";

-- AlterTable
ALTER TABLE "InsuranceCompany" DROP COLUMN "link";

-- DropTable
DROP TABLE "InsuranceDocument";

-- DropTable
DROP TABLE "InsuranceDocumentCarInfo";

-- DropTable
DROP TABLE "InsuranceDocumentHealthInfo";

-- DropTable
DROP TABLE "InsuranceDocumentLifeInfo";

-- DropTable
DROP TABLE "Member";

-- DropEnum
DROP TYPE "InsuranceHealthTypeEnum";
