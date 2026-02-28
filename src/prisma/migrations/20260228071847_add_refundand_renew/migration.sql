-- CreateTable
CREATE TABLE "InsuranceDocumentRenew" (
    "id" SERIAL NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "insuranceDocumentId" INTEGER,

    CONSTRAINT "InsuranceDocumentRenew_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "carNumber" TEXT NOT NULL,
    "idImage" TEXT NOT NULL,
    "carLicence" TEXT NOT NULL,
    "driveLicence" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "insuranceDocumentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InsuranceDocumentRenew" ADD CONSTRAINT "InsuranceDocumentRenew_insuranceDocumentId_fkey" FOREIGN KEY ("insuranceDocumentId") REFERENCES "InsuranceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_insuranceDocumentId_fkey" FOREIGN KEY ("insuranceDocumentId") REFERENCES "InsuranceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
