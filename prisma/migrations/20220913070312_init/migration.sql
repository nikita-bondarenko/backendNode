-- CreateTable
CREATE TABLE "User" (
    "uid" UUID NOT NULL,
    "email" VARCHAR(1000) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "nickname" VARCHAR(30) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "creator" UUID NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTag" (
    "token" TEXT,
    "refreshToken" TEXT NOT NULL,
    "expire" INTEGER NOT NULL DEFAULT 1800,
    "userUid" UUID
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTag_token_key" ON "UserTag"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserTag_refreshToken_key" ON "UserTag"("refreshToken");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_creator_fkey" FOREIGN KEY ("creator") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTag" ADD CONSTRAINT "UserTag_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
