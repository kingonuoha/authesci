/*
  Warnings:

  - You are about to drop the column `isVerified` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `verificationToken` on the `profiles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "profiles_verificationToken_key";

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "isVerified",
DROP COLUMN "verificationToken";
