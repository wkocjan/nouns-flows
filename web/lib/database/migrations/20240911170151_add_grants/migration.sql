/*
  Warnings:

  - You are about to drop the `drafts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "drafts";

-- CreateTable
CREATE TABLE "Draft" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "users" TEXT[],
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "isOnchain" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flowId" TEXT NOT NULL,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grant" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "isFlow" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "tagline" TEXT,
    "url" TEXT,
    "isRemoved" INTEGER NOT NULL,
    "blockNumber" TEXT NOT NULL,
    "parent" TEXT,

    CONSTRAINT "Grant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ponder_meta" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "_ponder_meta_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "isPrivate_1" ON "Draft"("isPrivate");

-- CreateIndex
CREATE INDEX "isOnchain_1" ON "Draft"("isOnchain");

-- CreateIndex
CREATE INDEX "flowId_1" ON "Draft"("flowId");

-- CreateIndex
CREATE INDEX "createdAt_1" ON "Draft"("createdAt");
