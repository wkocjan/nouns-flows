-- CreateTable
CREATE TABLE "drafts" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "users" TEXT[],
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "isOnchain" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "isPrivate_1" ON "drafts"("isPrivate");

-- CreateIndex
CREATE INDEX "isOnchain_1" ON "drafts"("isOnchain");

-- CreateIndex
CREATE INDEX "categoryId_1" ON "drafts"("categoryId");

-- CreateIndex
CREATE INDEX "createdAt_1" ON "drafts"("createdAt");
