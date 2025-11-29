/*
  Warnings:

  - A unique constraint covering the columns `[public_token]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.
  - The required column `public_token` was added to the `invoices` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "public_token" TEXT NOT NULL,
ADD COLUMN     "sent_at" TIMESTAMP(3),
ADD COLUMN     "stripe_session_id" TEXT,
ADD COLUMN     "viewed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "invoice_prefix" TEXT NOT NULL DEFAULT 'INV',
ADD COLUMN     "payment_terms_days" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "stripe_customer_id" TEXT;

-- CreateTable
CREATE TABLE "invoice_sequences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "invoice_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoice_sequences_user_id_year_key" ON "invoice_sequences"("user_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_public_token_key" ON "invoices"("public_token");

-- AddForeignKey
ALTER TABLE "invoice_sequences" ADD CONSTRAINT "invoice_sequences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
