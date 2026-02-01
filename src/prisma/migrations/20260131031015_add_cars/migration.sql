/*
  Warnings:

  - Added the required column `normalizedName` to the `CarMake` table without a default value. This is not possible if the table is not empty.
  - Added the required column `normalizedName` to the `CarModel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CarMake" ADD COLUMN     "normalizedName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CarModel" ADD COLUMN     "normalizedName" TEXT NOT NULL;
