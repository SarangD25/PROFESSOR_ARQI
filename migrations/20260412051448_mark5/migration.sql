/*
  Warnings:

  - You are about to drop the column `orgId` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationSentAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetSentAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId,concept]` on the table `WeakArea` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "orgId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerificationSentAt",
DROP COLUMN "isEmailVerified",
DROP COLUMN "password",
DROP COLUMN "passwordResetSentAt",
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'student';

-- DropTable
DROP TABLE "Organization";

-- CreateIndex
CREATE UNIQUE INDEX "WeakArea_studentId_concept_key" ON "WeakArea"("studentId", "concept");

-- AddForeignKey
ALTER TABLE "QRPaper" ADD CONSTRAINT "QRPaper_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSet" ADD CONSTRAINT "QuestionSet_qrPaperId_fkey" FOREIGN KEY ("qrPaperId") REFERENCES "QRPaper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "QuestionSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
