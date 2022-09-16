-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "UserTag" DROP CONSTRAINT "UserTag_userUid_fkey";

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "creatorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserTag" ALTER COLUMN "userUid" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTag" ADD CONSTRAINT "UserTag_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
