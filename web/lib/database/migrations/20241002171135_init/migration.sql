-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "web";

-- CreateTable
CREATE TABLE "web"."Draft" (
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
    "isFlow" BOOLEAN NOT NULL DEFAULT false,
    "transactionHash" TEXT,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "isPrivate_1" ON "web"."Draft"("isPrivate");

-- CreateIndex
CREATE INDEX "isOnchain_1" ON "web"."Draft"("isOnchain");

-- CreateIndex
CREATE INDEX "flowId_1" ON "web"."Draft"("flowId");

-- CreateIndex
CREATE INDEX "createdAt_1" ON "web"."Draft"("createdAt");
