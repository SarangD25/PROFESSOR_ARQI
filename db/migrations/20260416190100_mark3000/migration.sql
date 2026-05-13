-- AlterTable
ALTER TABLE "QRPaper" ADD COLUMN     "difficulty" TEXT;

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "orgStudentId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "marks" DOUBLE PRECISION NOT NULL,
    "maxMarks" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgConfig" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "weightAssignment" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "weightBehavior" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "weightPerformance" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "weightClassTest" DOUBLE PRECISION NOT NULL DEFAULT 0.4,

    CONSTRAINT "OrgConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrgConfig_orgId_key" ON "OrgConfig"("orgId");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_orgStudentId_fkey" FOREIGN KEY ("orgStudentId") REFERENCES "OrgStudent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgConfig" ADD CONSTRAINT "OrgConfig_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
