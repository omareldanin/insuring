-- CreateEnum
CREATE TYPE "CarTypeEnum" AS ENUM ('used', 'new');

-- AlterTable
ALTER TABLE "CarRules" ADD COLUMN     "type" "CarTypeEnum" NOT NULL DEFAULT 'new';
