CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "aiIntel" JSONB,
ADD COLUMN     "aiMatchScore" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "aiFeatureVector" vector,
ADD COLUMN     "aiIntel" JSONB,
ADD COLUMN     "aiRecommendedScientists" JSONB;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "link" TEXT,
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "aiFeatureVector" vector,
ADD COLUMN     "cvIntel" JSONB,
ADD COLUMN     "cvUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;
