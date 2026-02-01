-- AlterTable
ALTER TABLE "CarYear" ALTER COLUMN "minimumPrice" DROP NOT NULL,
ALTER COLUMN "minimumPrice" SET DEFAULT 0;
