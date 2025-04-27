-- CreateTable
CREATE TABLE "PredictionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageCount" INTEGER NOT NULL,
    "detections" JSONB NOT NULL,

    CONSTRAINT "PredictionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictionImage" (
    "id" TEXT NOT NULL,
    "originalImageUrl" TEXT NOT NULL,
    "annotatedImageUrl" TEXT,
    "predictionLogId" TEXT NOT NULL,

    CONSTRAINT "PredictionImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PredictionLog" ADD CONSTRAINT "PredictionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionImage" ADD CONSTRAINT "PredictionImage_predictionLogId_fkey" FOREIGN KEY ("predictionLogId") REFERENCES "PredictionLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
