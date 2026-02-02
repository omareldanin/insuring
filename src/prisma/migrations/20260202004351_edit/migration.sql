/*
  Warnings:

  - Added the required column `ruleType` to the `CarRules` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CarRuleType" AS ENUM ('RANGE', 'GROUP');

-- AlterTable
ALTER TABLE "CarRules" ADD COLUMN     "ruleType" "CarRuleType" NOT NULL,
ALTER COLUMN "from" DROP NOT NULL,
ALTER COLUMN "to" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CarRuleGroup" (
    "id" SERIAL NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "groupName" TEXT NOT NULL,
    "makeId" INTEGER NOT NULL,
    "modelId" INTEGER,
    "year" INTEGER,
    "carYearId" INTEGER,

    CONSTRAINT "CarRuleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarRuleGroup_groupName_idx" ON "CarRuleGroup"("groupName");

-- CreateIndex
CREATE INDEX "CarRuleGroup_makeId_modelId_year_idx" ON "CarRuleGroup"("makeId", "modelId", "year");

-- AddForeignKey
ALTER TABLE "CarRuleGroup" ADD CONSTRAINT "CarRuleGroup_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "CarRules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarRuleGroup" ADD CONSTRAINT "CarRuleGroup_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "CarMake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarRuleGroup" ADD CONSTRAINT "CarRuleGroup_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "CarModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarRuleGroup" ADD CONSTRAINT "CarRuleGroup_carYearId_fkey" FOREIGN KEY ("carYearId") REFERENCES "CarYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;
