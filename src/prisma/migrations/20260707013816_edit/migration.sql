/*
  Warnings:

  - You are about to drop the column `link` on the `InsuranceCompany` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PAYMENT_LINK', 'BANK_ACCOUNT');

-- AlterTable
ALTER TABLE "InsuranceCompany" DROP COLUMN "link",
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "paymentLink" TEXT,
ADD COLUMN     "paymentType" "PaymentType",
ADD COLUMN     "refundEmail" TEXT;
