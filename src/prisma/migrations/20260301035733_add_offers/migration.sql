-- AlterTable
ALTER TABLE "InsuranceDocument" ADD COLUMN     "offerId" INTEGER;

-- CreateTable
CREATE TABLE "Offers" (
    "id" SERIAL NOT NULL,
    "insuranceTypes" "InsuranceTypeEnum"[],
    "discount" INTEGER NOT NULL DEFAULT 0,
    "ordersCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InsuranceDocument" ADD CONSTRAINT "InsuranceDocument_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
