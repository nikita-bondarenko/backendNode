/*
  Warnings:

  - Added the required column `toucheAt` to the `UserTag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserTag" ADD COLUMN     "toucheAt" TEXT NOT NULL;
