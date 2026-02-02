-- CreateTable
CREATE TABLE "CarRules" (
    "id" SERIAL NOT NULL,
    "from" INTEGER NOT NULL,
    "to" INTEGER NOT NULL,
    "insuranceType" "InsuranceTypeEnum" NOT NULL,
    "persitage" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planId" INTEGER,
    "insuranceCompanyId" INTEGER,

    CONSTRAINT "CarRules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CarRules" ADD CONSTRAINT "CarRules_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarRules" ADD CONSTRAINT "CarRules_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;
