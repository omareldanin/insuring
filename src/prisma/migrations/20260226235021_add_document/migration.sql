-- CreateTable
CREATE TABLE "InsuranceDocument" (
    "id" SERIAL NOT NULL,
    "insuranceType" "InsuranceTypeEnum" NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidKey" TEXT,
    "userId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceDocumentCarInfo" (
    "id" SERIAL NOT NULL,
    "persitage" DOUBLE PRECISION NOT NULL,
    "price" INTEGER NOT NULL,
    "finalPrice" INTEGER NOT NULL,
    "idImage" TEXT NOT NULL,
    "carLicence" TEXT NOT NULL,
    "driveLicence" TEXT NOT NULL,
    "carYearId" INTEGER,
    "ruleId" INTEGER NOT NULL,
    "insuranceDocumentId" INTEGER NOT NULL,

    CONSTRAINT "InsuranceDocumentCarInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceDocumentLifeInfo" (
    "id" SERIAL NOT NULL,
    "persitage" DOUBLE PRECISION NOT NULL,
    "price" INTEGER NOT NULL,
    "finalPrice" INTEGER NOT NULL,
    "idImage" TEXT NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "insuranceDocumentId" INTEGER NOT NULL,

    CONSTRAINT "InsuranceDocumentLifeInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceDocumentHealthInfo" (
    "id" SERIAL NOT NULL,
    "type" "InsuranceHealthTypeEnum" NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "groupName" TEXT,
    "companyTaxRegister" TEXT,
    "companyCommercialRegister" TEXT,
    "insuranceDocumentId" INTEGER,

    CONSTRAINT "InsuranceDocumentHealthInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "UserGender" NOT NULL,
    "price" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "idImage" TEXT NOT NULL,
    "insuranceDocumentHealthInfoId" INTEGER,
    "ruleId" INTEGER NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InsuranceDocument_userId_companyId_idx" ON "InsuranceDocument"("userId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceDocumentCarInfo_insuranceDocumentId_key" ON "InsuranceDocumentCarInfo"("insuranceDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceDocumentLifeInfo_insuranceDocumentId_key" ON "InsuranceDocumentLifeInfo"("insuranceDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceDocumentHealthInfo_insuranceDocumentId_key" ON "InsuranceDocumentHealthInfo"("insuranceDocumentId");

-- AddForeignKey
ALTER TABLE "InsuranceDocument" ADD CONSTRAINT "InsuranceDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocument" ADD CONSTRAINT "InsuranceDocument_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocument" ADD CONSTRAINT "InsuranceDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "InsuranceCompany"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentCarInfo" ADD CONSTRAINT "InsuranceDocumentCarInfo_carYearId_fkey" FOREIGN KEY ("carYearId") REFERENCES "CarYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentCarInfo" ADD CONSTRAINT "InsuranceDocumentCarInfo_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "CarRules"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentCarInfo" ADD CONSTRAINT "InsuranceDocumentCarInfo_insuranceDocumentId_fkey" FOREIGN KEY ("insuranceDocumentId") REFERENCES "InsuranceDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentLifeInfo" ADD CONSTRAINT "InsuranceDocumentLifeInfo_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "LifeRules"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentLifeInfo" ADD CONSTRAINT "InsuranceDocumentLifeInfo_insuranceDocumentId_fkey" FOREIGN KEY ("insuranceDocumentId") REFERENCES "InsuranceDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentHealthInfo" ADD CONSTRAINT "InsuranceDocumentHealthInfo_insuranceDocumentId_fkey" FOREIGN KEY ("insuranceDocumentId") REFERENCES "InsuranceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_insuranceDocumentHealthInfoId_fkey" FOREIGN KEY ("insuranceDocumentHealthInfoId") REFERENCES "InsuranceDocumentHealthInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "HealthRules"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
