-- AlterTable
ALTER TABLE "CompanyPlan" ADD COLUMN     "arFeatures" TEXT[] DEFAULT ARRAY['third party liability', 'stantard support']::TEXT[];

-- AlterTable
ALTER TABLE "InsuranceCompany" ADD COLUMN     "arName" TEXT;

-- AlterTable
ALTER TABLE "InsurancePlan" ADD COLUMN     "arDescription" TEXT[],
ADD COLUMN     "arHint" TEXT,
ADD COLUMN     "arName" TEXT,
ALTER COLUMN "hint" DROP NOT NULL;
