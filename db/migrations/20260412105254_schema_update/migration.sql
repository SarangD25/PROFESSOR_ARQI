-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "orgStudentId" TEXT,
ALTER COLUMN "studentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'individual',
ADD COLUMN     "orgId" TEXT;

-- AlterTable
ALTER TABLE "PyqChunk" ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "QRPaper" ADD COLUMN     "orgStudentId" TEXT,
ALTER COLUMN "studentId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgStudent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rollNo" TEXT NOT NULL,
    "section" TEXT,
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgStudent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OrgStudent_rollNo_orgId_key" ON "OrgStudent"("rollNo", "orgId");

-- AddForeignKey
ALTER TABLE "OrgStudent" ADD CONSTRAINT "OrgStudent_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRPaper" ADD CONSTRAINT "QRPaper_orgStudentId_fkey" FOREIGN KEY ("orgStudentId") REFERENCES "OrgStudent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
