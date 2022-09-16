/*
  Warnings:

  - Made the column `userUid` on table `UserTag` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "UserTag" DROP CONSTRAINT "UserTag_userUid_fkey";

-- AlterTable
ALTER TABLE "UserTag" ALTER COLUMN "userUid" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "UserTag" ADD CONSTRAINT "UserTag_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
