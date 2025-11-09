/*
  Warnings:

  - You are about to drop the column `employer_id` on the `jobs` table. All the data in the column will be lost.
  - Added the required column `employerId` to the `jobs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_employer_id_fkey";

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "employer_id",
ADD COLUMN     "employerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
