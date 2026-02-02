/*
  Warnings:

  - You are about to drop the column `description` on the `CompanyPlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CompanyPlan" DROP COLUMN "description",
ADD COLUMN     "features" TEXT[] DEFAULT ARRAY['third party liability', 'stantard support']::TEXT[];
