/*
  Warnings:

  - You are about to drop the column `features` on the `CompanyPlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CompanyPlan" DROP COLUMN "features",
ADD COLUMN     "description" TEXT[] DEFAULT ARRAY['third party liability', 'stantard support']::TEXT[];

-- AlterTable
ALTER TABLE "InsurancePlan" ALTER COLUMN "hint" DROP DEFAULT,
ALTER COLUMN "description" DROP DEFAULT;
