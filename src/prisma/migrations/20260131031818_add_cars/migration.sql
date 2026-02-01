/*
  Warnings:

  - A unique constraint covering the columns `[normalizedName]` on the table `CarMake` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[normalizedName,makeId]` on the table `CarModel` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CarModel_name_makeId_key";

-- CreateIndex
CREATE UNIQUE INDEX "CarMake_normalizedName_key" ON "CarMake"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "CarModel_normalizedName_makeId_key" ON "CarModel"("normalizedName", "makeId");
