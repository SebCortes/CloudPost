/*
  Warnings:

  - Added the required column `authorName` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfWords` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeToRead` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PostCategory" AS ENUM ('Idea', 'Question', 'Announcement', 'Tutorial', 'Story');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "authorName" TEXT NOT NULL,
ADD COLUMN     "category" "PostCategory" NOT NULL,
ADD COLUMN     "numberOfLikes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numberOfWords" INTEGER NOT NULL,
ADD COLUMN     "timeToRead" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Post_category_idx" ON "Post"("category");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
