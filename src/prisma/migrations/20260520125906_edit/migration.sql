-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdByPartnerId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdByPartnerId_fkey" FOREIGN KEY ("createdByPartnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
