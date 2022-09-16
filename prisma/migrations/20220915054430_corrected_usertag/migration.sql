/*
  Warnings:

  - Made the column `token` on table `UserTag` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserTag" ALTER COLUMN "token" SET NOT NULL;
