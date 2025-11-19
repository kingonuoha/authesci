/*
  Warnings:

  - You are about to drop the column `employerId` on the `jobs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[verificationToken]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employer_id` to the `jobs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_employerId_fkey";

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "employerId",
ADD COLUMN     "employer_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_verificationToken_key" ON "profiles"("verificationToken");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
