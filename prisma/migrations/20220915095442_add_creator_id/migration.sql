/*
  Warnings:

  - You are about to drop the column `creator` on the `Tag` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_creator_fkey";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "creator",
ADD COLUMN     "creatorId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
