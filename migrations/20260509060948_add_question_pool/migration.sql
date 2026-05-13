-- CreateTable
CREATE TABLE "GeneratedQuestionPool" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedQuestionPool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeneratedQuestionPool_topic_examName_idx" ON "GeneratedQuestionPool"("topic", "examName");
