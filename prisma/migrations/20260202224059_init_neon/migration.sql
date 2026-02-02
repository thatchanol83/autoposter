-- CreateTable
CREATE TABLE "VideoRequest" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "aspectRatio" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoRequest_pkey" PRIMARY KEY ("id")
);
