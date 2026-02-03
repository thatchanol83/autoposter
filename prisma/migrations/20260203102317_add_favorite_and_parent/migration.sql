-- AlterTable
ALTER TABLE "VideoRequest" ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentRequestId" TEXT;
