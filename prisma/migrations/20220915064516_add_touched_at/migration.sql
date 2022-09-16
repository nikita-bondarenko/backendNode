/*
  Warnings:

  - You are about to drop the column `toucheAt` on the `UserTag` table. All the data in the column will be lost.
  - Added the required column `touchedAt` to the `UserTag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserTag" DROP COLUMN "toucheAt",
ADD COLUMN     "touchedAt" TEXT NOT NULL;
