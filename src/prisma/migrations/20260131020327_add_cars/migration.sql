-- CreateTable
CREATE TABLE "CarMake" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarMake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarModel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "makeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarYear" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "minimumPrice" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarYear_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarMake_name_key" ON "CarMake"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CarModel_name_makeId_key" ON "CarModel"("name", "makeId");

-- CreateIndex
CREATE UNIQUE INDEX "CarYear_year_modelId_key" ON "CarYear"("year", "modelId");

-- AddForeignKey
ALTER TABLE "CarModel" ADD CONSTRAINT "CarModel_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "CarMake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarYear" ADD CONSTRAINT "CarYear_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "CarModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
