-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "final_price" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "platform_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "scientist_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "account_name" TEXT,
ADD COLUMN     "account_number" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "recipient_code" TEXT;
