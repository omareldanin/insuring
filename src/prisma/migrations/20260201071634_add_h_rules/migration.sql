-- CreateTable
CREATE TABLE "HealthRules" (
    "id" SERIAL NOT NULL,
    "from" INTEGER NOT NULL,
    "to" INTEGER NOT NULL,
    "gender" "UserGender" NOT NULL,
    "insuranceType" "InsuranceTypeEnum" NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planId" INTEGER,
    "insuranceCompanyId" INTEGER,

    CONSTRAINT "HealthRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifeRules" (
    "id" SERIAL NOT NULL,
    "from" INTEGER NOT NULL,
    "to" INTEGER NOT NULL,
    "gender" "UserGender" NOT NULL,
    "insuranceType" "InsuranceTypeEnum" NOT NULL,
    "persitage" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planId" INTEGER,
    "insuranceCompanyId" INTEGER,

    CONSTRAINT "LifeRules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HealthRules" ADD CONSTRAINT "HealthRules_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthRules" ADD CONSTRAINT "HealthRules_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeRules" ADD CONSTRAINT "LifeRules_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeRules" ADD CONSTRAINT "LifeRules_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;
