-- CreateExtension
CREATE EXTENSION IF NOT EXISTS ltree;

-- AlterTable
ALTER TABLE "Topic"
ADD COLUMN "path" LTREE,
ADD COLUMN "parentId" TEXT;

-- CreateIndex
CREATE INDEX "Topic_path_idx" ON "Topic" USING GIST ("path");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;