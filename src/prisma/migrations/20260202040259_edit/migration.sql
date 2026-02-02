/*
  Warnings:

  - The `description` column on the `InsurancePlan` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "InsurancePlan" ADD COLUMN     "hint" TEXT NOT NULL DEFAULT 'from 1200 EGP / Year',
ADD COLUMN     "recommend" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "description",
ADD COLUMN     "description" TEXT[] DEFAULT ARRAY['third party liability', 'stantard support']::TEXT[];
