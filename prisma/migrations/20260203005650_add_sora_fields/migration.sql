-- AlterTable
ALTER TABLE "VideoRequest" ADD COLUMN     "soraTaskId" TEXT,
ADD COLUMN     "videoStatus" TEXT NOT NULL DEFAULT 'idle',
ADD COLUMN     "videoUrl" TEXT;
