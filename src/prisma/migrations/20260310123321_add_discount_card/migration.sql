/*
  Warnings:

  - Added the required column `years` to the `LifeRules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LifeRules" ADD COLUMN     "years" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "DiscountCard" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    "idImage" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidKey" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DiscountCard" ADD CONSTRAINT "DiscountCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
