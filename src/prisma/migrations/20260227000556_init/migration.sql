-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CLIENT', 'PARTNER');

-- CreateEnum
CREATE TYPE "UserGender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "InsuranceTypeEnum" AS ENUM ('CAR', 'HEALTH', 'LIFE');

-- CreateEnum
CREATE TYPE "InsuranceHealthTypeEnum" AS ENUM ('INDIVIDUAL', 'FAMILY', 'GROUP');

-- CreateEnum
CREATE TYPE "CarTypeEnum" AS ENUM ('used', 'new');

-- CreateEnum
CREATE TYPE "CompanyTypeEnum" AS ENUM ('SOLIDARITY', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "CarRuleType" AS ENUM ('RANGE', 'GROUP');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" "UserGender" NOT NULL,
    "avatar" TEXT,
    "fcm" TEXT[],
    "password" TEXT NOT NULL,
    "refresh_tokens" TEXT[],
    "role" "UserRole" NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "birthDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshSession" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "fcm" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneOtp" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "userId" INTEGER,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurancePlan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "arName" TEXT,
    "hint" TEXT,
    "arHint" TEXT,
    "description" TEXT[],
    "arDescription" TEXT[],
    "recommend" BOOLEAN NOT NULL DEFAULT false,
    "forHealthGroups" BOOLEAN NOT NULL DEFAULT false,
    "insuranceType" "InsuranceTypeEnum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsurancePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceCompany" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "arName" TEXT,
    "logo" TEXT,
    "link" TEXT,
    "email" TEXT NOT NULL,
    "ruleType" "CarRuleType" NOT NULL DEFAULT 'RANGE',
    "companyType" "CompanyTypeEnum" NOT NULL,
    "insuranceTypes" "InsuranceTypeEnum"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "link2" TEXT,

    CONSTRAINT "InsuranceCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPlan" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "features" TEXT[] DEFAULT ARRAY['third party liability', 'stantard support']::TEXT[],
    "arFeatures" TEXT[] DEFAULT ARRAY['third party liability', 'stantard support']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarMake" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarMake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarModel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "makeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarYear" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "minimumPrice" INTEGER DEFAULT 0,
    "modelId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarYear_pkey" PRIMARY KEY ("id")
);

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
    "persitage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planId" INTEGER,
    "insuranceCompanyId" INTEGER,

    CONSTRAINT "LifeRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarRules" (
    "id" SERIAL NOT NULL,
    "ruleType" "CarRuleType" NOT NULL,
    "from" INTEGER,
    "to" INTEGER,
    "persitage" DOUBLE PRECISION NOT NULL,
    "type" "CarTypeEnum" NOT NULL DEFAULT 'new',
    "insuranceType" "InsuranceTypeEnum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planId" INTEGER,
    "insuranceCompanyId" INTEGER,

    CONSTRAINT "CarRules_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshSession_token_key" ON "RefreshSession"("token");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePlan_name_insuranceType_key" ON "InsurancePlan"("name", "insuranceType");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_name_key" ON "InsuranceCompany"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_email_key" ON "InsuranceCompany"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPlan_companyId_planId_key" ON "CompanyPlan"("companyId", "planId");

-- CreateIndex
CREATE UNIQUE INDEX "CarMake_name_key" ON "CarMake"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CarMake_normalizedName_key" ON "CarMake"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "CarModel_normalizedName_makeId_key" ON "CarModel"("normalizedName", "makeId");

-- CreateIndex
CREATE UNIQUE INDEX "CarYear_year_modelId_key" ON "CarYear"("year", "modelId");

-- CreateIndex
CREATE INDEX "CarRuleGroup_groupName_idx" ON "CarRuleGroup"("groupName");

-- CreateIndex
CREATE INDEX "CarRuleGroup_makeId_modelId_year_idx" ON "CarRuleGroup"("makeId", "modelId", "year");

-- CreateIndex
CREATE INDEX "InsuranceDocument_userId_companyId_idx" ON "InsuranceDocument"("userId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceDocumentCarInfo_insuranceDocumentId_key" ON "InsuranceDocumentCarInfo"("insuranceDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceDocumentLifeInfo_insuranceDocumentId_key" ON "InsuranceDocumentLifeInfo"("insuranceDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceDocumentHealthInfo_insuranceDocumentId_key" ON "InsuranceDocumentHealthInfo"("insuranceDocumentId");

-- AddForeignKey
ALTER TABLE "RefreshSession" ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPlan" ADD CONSTRAINT "CompanyPlan_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPlan" ADD CONSTRAINT "CompanyPlan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarModel" ADD CONSTRAINT "CarModel_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "CarMake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarYear" ADD CONSTRAINT "CarYear_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "CarModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthRules" ADD CONSTRAINT "HealthRules_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthRules" ADD CONSTRAINT "HealthRules_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeRules" ADD CONSTRAINT "LifeRules_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeRules" ADD CONSTRAINT "LifeRules_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarRules" ADD CONSTRAINT "CarRules_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarRules" ADD CONSTRAINT "CarRules_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarRuleGroup" ADD CONSTRAINT "CarRuleGroup_carYearId_fkey" FOREIGN KEY ("carYearId") REFERENCES "CarYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarRuleGroup" ADD CONSTRAINT "CarRuleGroup_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "CarMake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarRuleGroup" ADD CONSTRAINT "CarRuleGroup_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "CarModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarRuleGroup" ADD CONSTRAINT "CarRuleGroup_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "CarRules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocument" ADD CONSTRAINT "InsuranceDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "InsuranceCompany"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocument" ADD CONSTRAINT "InsuranceDocument_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocument" ADD CONSTRAINT "InsuranceDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentCarInfo" ADD CONSTRAINT "InsuranceDocumentCarInfo_carYearId_fkey" FOREIGN KEY ("carYearId") REFERENCES "CarYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentCarInfo" ADD CONSTRAINT "InsuranceDocumentCarInfo_insuranceDocumentId_fkey" FOREIGN KEY ("insuranceDocumentId") REFERENCES "InsuranceDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentCarInfo" ADD CONSTRAINT "InsuranceDocumentCarInfo_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "CarRules"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentLifeInfo" ADD CONSTRAINT "InsuranceDocumentLifeInfo_insuranceDocumentId_fkey" FOREIGN KEY ("insuranceDocumentId") REFERENCES "InsuranceDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentLifeInfo" ADD CONSTRAINT "InsuranceDocumentLifeInfo_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "LifeRules"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocumentHealthInfo" ADD CONSTRAINT "InsuranceDocumentHealthInfo_insuranceDocumentId_fkey" FOREIGN KEY ("insuranceDocumentId") REFERENCES "InsuranceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_insuranceDocumentHealthInfoId_fkey" FOREIGN KEY ("insuranceDocumentHealthInfoId") REFERENCES "InsuranceDocumentHealthInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "HealthRules"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
