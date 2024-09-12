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

-- CreateIndex
CREATE INDEX "isPrivate_1" ON "Draft"("isPrivate");

-- CreateIndex
CREATE INDEX "isOnchain_1" ON "Draft"("isOnchain");

-- CreateIndex
CREATE INDEX "flowId_1" ON "Draft"("flowId");

-- CreateIndex
CREATE INDEX "createdAt_1" ON "Draft"("createdAt");
