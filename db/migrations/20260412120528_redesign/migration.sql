/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `orgId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - Made the column `section` on table `OrgStudent` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `teacherId` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrgStudent" ALTER COLUMN "section" SET NOT NULL,
ALTER COLUMN "section" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "createdBy",
ADD COLUMN     "teacherId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "orgId",
DROP COLUMN "username";
